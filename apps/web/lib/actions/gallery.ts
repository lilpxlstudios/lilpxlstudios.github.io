"use server";

import { randomUUID } from "crypto";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { listDriveImages, downloadDriveFile } from "@/lib/googleDrive";
import { canTransitionOrderStatus, type DeliveryPhoto, type Order } from "@lps/shared";

export type SyncDeliveryPhotosState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; synced: number; total: number };

const THUMB_WIDTH = 640;

// Mirrors syncProofsFromDrive, but for the delivery (final gallery) folder —
// a separate Drive link and a separate subcollection, since delivery photos
// are viewed, not selected.
export async function syncDeliveryPhotosFromDrive(
  orderId: string,
  _prevState: SyncDeliveryPhotosState
): Promise<SyncDeliveryPhotosState> {
  await requireAdmin();

  const orderRef = adminDb.collection("orders").doc(orderId);
  const orderSnap = await orderRef.get();
  if (!orderSnap.exists) {
    return { status: "error", message: "Order not found." };
  }
  const order = orderSnap.data() as Order;
  if (!order.deliveryDriveLink) {
    return { status: "error", message: "Attach a delivery Drive folder first." };
  }

  let images;
  try {
    images = await listDriveImages(order.deliveryDriveLink.folderId);
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Could not list Drive folder." };
  }

  const bucket = adminStorage.bucket();
  const photosCollection = orderRef.collection("deliveryPhotos");
  let synced = 0;

  for (let i = 0; i < images.length; i++) {
    const image = images[i]!;
    const photoRef = photosCollection.doc(image.id);
    const existing = await photoRef.get();
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

    const storagePath = `orders/${orderId}/deliveryThumbs/${image.id}.jpg`;
    const token = randomUUID();
    const file = bucket.file(storagePath);
    await file.save(thumbBuffer, {
      metadata: {
        contentType: "image/jpeg",
        metadata: { firebaseStorageDownloadTokens: token },
      },
    });
    const thumbUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;

    const photo: DeliveryPhoto = {
      id: image.id,
      fileName: image.name,
      driveFileId: image.id,
      thumbStoragePath: storagePath,
      thumbUrl,
      index: i,
    };
    await photoRef.set(photo);
    synced++;
  }

  const totalCount = (await photosCollection.count().get()).data().count;
  const nextStatus = canTransitionOrderStatus(order.status, "delivered") ? "delivered" : order.status;

  await orderRef.update({ status: nextStatus, updatedAt: Date.now() });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/portal/orders/${orderId}`);
  return { status: "success", synced, total: totalCount };
}
