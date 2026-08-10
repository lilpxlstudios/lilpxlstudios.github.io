"use server";

import { randomUUID } from "crypto";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { listDriveImages, downloadDriveFile } from "@/lib/googleDrive";
import { canTransitionOrderStatus, type Order, type Proof } from "@lps/shared";

export type SyncProofsState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; synced: number; total: number };

const THUMB_WIDTH = 640;

export async function syncProofsFromDrive(
  orderId: string,
  _prevState: SyncProofsState
): Promise<SyncProofsState> {
  await requireAdmin();

  const orderRef = adminDb.collection("orders").doc(orderId);
  const orderSnap = await orderRef.get();
  if (!orderSnap.exists) {
    return { status: "error", message: "Order not found." };
  }
  const order = orderSnap.data() as Order;
  if (!order.proofsDriveLink) {
    return { status: "error", message: "Attach a proofs Drive folder first." };
  }

  let images;
  try {
    images = await listDriveImages(order.proofsDriveLink.folderId);
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Could not list Drive folder." };
  }

  const bucket = adminStorage.bucket();
  const proofsCollection = orderRef.collection("proofs");
  let synced = 0;

  for (let i = 0; i < images.length; i++) {
    const image = images[i]!;
    const proofRef = proofsCollection.doc(image.id);
    const existing = await proofRef.get();
    if (existing.exists) {
      synced++;
      continue; // already synced on a previous run
    }

    let buffer: Buffer;
    try {
      buffer = await downloadDriveFile(image.id);
    } catch {
      continue; // skip files we can't read; admin can re-run sync
    }

    const thumbBuffer = await sharp(buffer)
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const storagePath = `orders/${orderId}/proofThumbs/${image.id}.jpg`;
    const token = randomUUID();
    const file = bucket.file(storagePath);
    await file.save(thumbBuffer, {
      metadata: {
        contentType: "image/jpeg",
        metadata: { firebaseStorageDownloadTokens: token },
      },
    });
    const thumbUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;

    const proof: Proof = {
      id: image.id,
      fileName: image.name,
      driveFileId: image.id,
      thumbStoragePath: storagePath,
      thumbUrl,
      selected: false,
      selectedAt: null,
      index: i,
    };
    await proofRef.set(proof);
    synced++;
  }

  const totalCount = (await proofsCollection.count().get()).data().count;
  const nextStatus = canTransitionOrderStatus(order.status, "proofs_ready") ? "proofs_ready" : order.status;

  await orderRef.update({
    status: nextStatus,
    "selectionState.totalCount": totalCount,
    updatedAt: Date.now(),
  });

  revalidatePath(`/admin/orders/${orderId}`);
  return { status: "success", synced, total: totalCount };
}
