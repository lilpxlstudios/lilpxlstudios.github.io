import { NextResponse } from "next/server";
import { requireSession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import { downloadDriveFile } from "@/lib/googleDrive";
import type { DeliveryPhoto, Order } from "@lps/shared";

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  tif: "image/tiff",
  tiff: "image/tiff",
};

function guessContentType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXTENSION[ext] ?? "application/octet-stream";
}

// Streams a full-resolution delivery photo from Drive through our service
// account credentials, so the Drive folder only ever needs to be shared with
// that service account (same requirement as proofs) — never made public.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string; photoId: string }> }
) {
  const session = await requireSession();
  const { orderId, photoId } = await params;

  const orderSnap = await adminDb.collection("orders").doc(orderId).get();
  if (!orderSnap.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const order = orderSnap.data() as Order;
  if (order.clientUid !== session.uid && !session.admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const photoSnap = await orderSnap.ref.collection("deliveryPhotos").doc(photoId).get();
  if (!photoSnap.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const photo = photoSnap.data() as DeliveryPhoto;

  let buffer: Buffer;
  try {
    buffer = await downloadDriveFile(photo.driveFileId);
  } catch {
    return NextResponse.json({ error: "Could not fetch file from Drive" }, { status: 502 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": guessContentType(photo.fileName),
      "Content-Disposition": `attachment; filename="${photo.fileName}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
