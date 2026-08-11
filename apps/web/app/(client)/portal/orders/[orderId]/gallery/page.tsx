import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import type { DeliveryPhoto, Order } from "@lps/shared";
import { GalleryGrid } from "./GalleryGrid";

async function getOrder(orderId: string): Promise<Order | null> {
  const snap = await adminDb.collection("orders").doc(orderId).get();
  return snap.exists ? (snap.data() as Order) : null;
}

async function getDeliveryPhotos(orderId: string): Promise<DeliveryPhoto[]> {
  const snap = await adminDb
    .collection("orders")
    .doc(orderId)
    .collection("deliveryPhotos")
    .orderBy("index")
    .get();
  return snap.docs.map((doc) => doc.data() as DeliveryPhoto);
}

export default async function GalleryPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const session = await requireSession();
  const order = await getOrder(orderId);
  if (!order || (order.clientUid !== session.uid && !session.admin)) notFound();

  const photos = await getDeliveryPhotos(orderId);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link href={`/portal/orders/${orderId}`} className="text-sm text-ink-500">
          ← Back to order
        </Link>
        <h1 className="text-2xl mt-2">Your photo gallery</h1>
        <p className="text-ink-500 text-sm">
          Click any photo to download the full-resolution file.
        </p>
      </div>
      {photos.length === 0 ? (
        <p className="text-ink-500 text-sm">Your gallery isn&apos;t ready yet — check back soon.</p>
      ) : (
        <GalleryGrid orderId={orderId} photos={photos} />
      )}
    </div>
  );
}
