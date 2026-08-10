import "server-only";
import { JWT } from "google-auth-library";

function serviceAccountCredentials() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set");
  return JSON.parse(raw) as { client_email: string; private_key: string };
}

export function serviceAccountEmail(): string {
  return serviceAccountCredentials().client_email;
}

let cachedClient: JWT | null = null;
function driveClient(): JWT {
  if (cachedClient) return cachedClient;
  const { client_email, private_key } = serviceAccountCredentials();
  cachedClient = new JWT({
    email: client_email,
    key: private_key,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  return cachedClient;
}

// Accepts a full Drive folder URL (several formats) or a bare folder ID.
export function extractDriveFolderId(input: string): string | null {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (urlMatch) return urlMatch[1];
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) return trimmed;
  return null;
}

export type DriveFolderCheck =
  | { ok: true; folderId: string; name: string }
  | { ok: false; error: string };

// Confirms the folder exists, is actually a folder, and is shared with our
// service account — called when the admin attaches a Drive link to an order,
// so a typo or missing share is caught immediately instead of at sync time.
export async function checkDriveFolderAccess(input: string): Promise<DriveFolderCheck> {
  const folderId = extractDriveFolderId(input);
  if (!folderId) {
    return { ok: false, error: "That doesn't look like a Google Drive folder link." };
  }

  const client = driveClient();
  const accessToken = await client.getAccessToken();

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,mimeType&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${accessToken.token}` } }
  );

  if (response.status === 404 || response.status === 403) {
    return {
      ok: false,
      error: `Folder not found or not shared with ${serviceAccountEmail()}. Share the folder with that email (Viewer access) and try again.`,
    };
  }
  if (!response.ok) {
    return { ok: false, error: `Google Drive returned an unexpected error (${response.status}).` };
  }

  const data = (await response.json()) as { id: string; name: string; mimeType: string };
  if (data.mimeType !== "application/vnd.google-apps.folder") {
    return { ok: false, error: "That link points to a file, not a folder." };
  }

  return { ok: true, folderId: data.id, name: data.name };
}

export type DriveImageFile = { id: string; name: string };

// Lists image files directly inside a Drive folder (non-recursive) — used by the
// proof-sync action. Assumes the folder is already shared with the service account.
export async function listDriveImages(folderId: string): Promise<DriveImageFile[]> {
  const client = driveClient();
  const accessToken = await client.getAccessToken();

  const files: DriveImageFile[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL("https://www.googleapis.com/drive/v3/files");
    url.searchParams.set(
      "q",
      `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`
    );
    url.searchParams.set("fields", "nextPageToken, files(id, name)");
    url.searchParams.set("pageSize", "1000");
    url.searchParams.set("supportsAllDrives", "true");
    url.searchParams.set("includeItemsFromAllDrives", "true");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken.token}` } });
    if (!response.ok) {
      throw new Error(`Drive API list failed (${response.status})`);
    }
    const data = (await response.json()) as { files: DriveImageFile[]; nextPageToken?: string };
    files.push(...data.files);
    pageToken = data.nextPageToken;
  } while (pageToken);

  return files;
}

// Downloads raw file bytes for thumbnail generation.
export async function downloadDriveFile(fileId: string): Promise<Buffer> {
  const client = driveClient();
  const accessToken = await client.getAccessToken();

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${accessToken.token}` } }
  );
  if (!response.ok) {
    throw new Error(`Drive API download failed for ${fileId} (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
