import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import type { Order, Proof } from "@lps/shared";
import { SelectionGrid } from "./SelectionGrid";

async function getOrder(orderId: string): Promise<Order | null> {
  const snap = await adminDb.collection("orders").doc(orderId).get();
  return snap.exists ? (snap.data() as Order) : null;
}

async function getProofs(orderId: string): Promise<Proof[]> {
  const snap = await adminDb.collection("orders").doc(orderId).collection("proofs").orderBy("index").get();
  return snap.docs.map((doc) => doc.data() as Proof);
}

export default async function SelectPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const session = await requireSession();
  const order = await getOrder(orderId);
  if (!order || (order.clientUid !== session.uid && !session.admin)) notFound();
  if (order.selectionState.status === "completed") {
    redirect(`/portal/orders/${orderId}`);
  }

  const proofs = await getProofs(orderId);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl">Select your photos</h1>
        <p className="text-ink-500 text-sm">
          Click a photo to select it. When you&apos;re happy with your picks, submit your selection below.
        </p>
      </div>
      <SelectionGrid orderId={orderId} initialProofs={proofs} />
    </div>
  );
}
