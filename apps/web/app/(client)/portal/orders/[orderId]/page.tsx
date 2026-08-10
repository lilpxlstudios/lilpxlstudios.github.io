import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/dal";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { PaymentPanel } from "./PaymentPanel";
import type { Invoice, Order } from "@lps/shared";

async function getOrder(orderId: string): Promise<Order | null> {
  const snap = await adminDb.collection("orders").doc(orderId).get();
  return snap.exists ? (snap.data() as Order) : null;
}

async function getInvoice(orderId: string): Promise<{ data: Invoice; downloadUrl: string } | null> {
  const snap = await adminDb.collection("invoices").where("orderId", "==", orderId).limit(1).get();
  if (snap.empty) return null;
  const data = snap.docs[0]!.data() as Invoice;
  const [downloadUrl] = await adminStorage
    .bucket()
    .file(data.pdfStoragePath!)
    .getSignedUrl({ action: "read", expires: Date.now() + 15 * 60 * 1000 });
  return { data, downloadUrl };
}

export default async function ClientOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const session = await requireSession();
  const order = await getOrder(orderId);
  if (!order || (order.clientUid !== session.uid && !session.admin)) notFound();

  const canSelect = order.proofsDriveLink && order.selectionState.totalCount > 0;
  const selectionDone = order.selectionState.status === "completed";
  const invoice = await getInvoice(orderId);

  return (
    <div className="flex flex-col gap-8 max-w-xl">
      <div>
        <Link href="/portal" className="text-sm text-ink-500">
          ← Your shoots
        </Link>
        <h1 className="text-2xl mt-2">{order.shootType}</h1>
        <p className="text-ink-500 text-sm">{new Date(order.shootDate).toLocaleDateString()}</p>
      </div>

      {order.deliveryDriveLink && (
        <a
          href={order.deliveryDriveLink.url}
          target="_blank"
          rel="noreferrer"
          className="self-start bg-ink-900 text-paper-50 rounded-md px-4 py-2 text-sm"
        >
          View & download your photos
        </a>
      )}

      {canSelect && (
        <div className="flex flex-col gap-2 border-t border-ink-100 pt-6">
          <p className="text-sm text-ink-700 font-medium">Photo selection</p>
          {selectionDone ? (
            <p className="text-sm text-ink-500">
              You selected {order.selectionState.selectedCount} of {order.selectionState.totalCount}{" "}
              photos on {new Date(order.selectionState.completedAt!).toLocaleDateString()}.
            </p>
          ) : (
            <>
              <p className="text-sm text-ink-500">
                {order.selectionState.totalCount} proofs are ready for you to choose from.
              </p>
              <Link
                href={`/portal/orders/${order.id}/select`}
                className="self-start bg-accent-600 text-paper-50 rounded-md px-4 py-2 text-sm"
              >
                Select your photos
              </Link>
            </>
          )}
        </div>
      )}

      <PaymentPanel orderId={order.id} initialOrder={order} />

      {invoice && (
        <div className="flex flex-col gap-2 border-t border-ink-100 pt-6">
          <p className="text-sm text-ink-700 font-medium">Invoice {invoice.data.invoiceNumber}</p>
          <a href={invoice.downloadUrl} className="self-start text-sm text-accent-600">
            Download invoice (PDF)
          </a>
        </div>
      )}
    </div>
  );
}
