import Link from "next/link";
import { notFound } from "next/navigation";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import {
  ORDER_STATUS_TRANSITIONS,
  type DeliveryPhoto,
  type Invoice,
  type Order,
  type Proof,
  type SelectionExport,
} from "@lps/shared";
import { StatusForm } from "./StatusForm";
import { DriveLinkForm } from "./DriveLinkForm";
import { AmountForm } from "./AmountForm";
import { SyncProofsButton } from "./SyncProofsButton";
import { SyncDeliveryButton } from "./SyncDeliveryButton";
import { ReopenSelectionButton } from "./ReopenSelectionButton";
import { GenerateInvoiceButton } from "./GenerateInvoiceButton";

async function getOrder(orderId: string): Promise<Order | null> {
  const snap = await adminDb.collection("orders").doc(orderId).get();
  return snap.exists ? (snap.data() as Order) : null;
}

async function getProofs(orderId: string): Promise<Proof[]> {
  const snap = await adminDb.collection("orders").doc(orderId).collection("proofs").orderBy("index").get();
  return snap.docs.map((doc) => doc.data() as Proof);
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

async function getLatestExport(orderId: string): Promise<{ data: SelectionExport; downloadUrl: string } | null> {
  const snap = await adminDb
    .collection("orders")
    .doc(orderId)
    .collection("selectionExports")
    .orderBy("generatedAt", "desc")
    .limit(1)
    .get();
  if (snap.empty) return null;
  const data = snap.docs[0]!.data() as SelectionExport;
  const [downloadUrl] = await adminStorage
    .bucket()
    .file(data.csvStoragePath)
    .getSignedUrl({ action: "read", expires: Date.now() + 15 * 60 * 1000 });
  return { data, downloadUrl };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await getOrder(orderId);
  if (!order) notFound();

  const [proofs, deliveryPhotos, latestExport, invoice] = await Promise.all([
    getProofs(orderId),
    getDeliveryPhotos(orderId),
    getLatestExport(orderId),
    getInvoice(orderId),
  ]);
  // "invoiced" is reachable only via GenerateInvoiceButton, which creates the actual
  // invoice doc/PDF — offering it in the generic dropdown would let an order end up
  // "invoiced" with nothing to show the client.
  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status].filter((s) => s !== "invoiced");

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <Link href={`/admin/clients/${order.clientUid}`} className="text-sm text-ink-500">
          ← {order.clientName}
        </Link>
        <h1 className="text-2xl mt-2">{order.shootType}</h1>
        <p className="text-ink-500 text-sm">
          {new Date(order.shootDate).toLocaleDateString()} · {order.clientEmail}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-ink-700 font-medium">
          Status: <span className="font-normal">{order.status}</span>
        </p>
        <StatusForm orderId={order.id} nextStatuses={nextStatuses} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-ink-700 font-medium">Amount due</p>
        <AmountForm orderId={order.id} amountDue={order.amountDue} />
      </div>

      <div className="flex flex-col gap-2 border-t border-ink-100 pt-6">
        <p className="text-sm text-ink-700 font-medium">Invoice</p>
        {invoice ? (
          <div className="flex items-center gap-3">
            <p className="text-sm text-ink-500">
              {invoice.data.invoiceNumber} · issued {new Date(invoice.data.issuedAt!).toLocaleDateString()}
            </p>
            <a href={invoice.downloadUrl} className="text-sm text-accent-600">
              Download PDF (link expires in 15 min)
            </a>
          </div>
        ) : order.status === "paid" ? (
          <GenerateInvoiceButton orderId={order.id} />
        ) : (
          <p className="text-sm text-ink-500">Available once the order is marked paid.</p>
        )}
      </div>

      <div className="flex flex-col gap-6 border-t border-ink-100 pt-6">
        <DriveLinkForm
          orderId={order.id}
          linkType="proofs"
          label="Proofs folder (for photo selection)"
          existing={order.proofsDriveLink}
        />
        <DriveLinkForm
          orderId={order.id}
          linkType="delivery"
          label="Delivery folder (final photos)"
          existing={order.deliveryDriveLink}
        />
      </div>

      {order.proofsDriveLink && (
        <div className="flex flex-col gap-3 border-t border-ink-100 pt-6">
          <p className="text-sm text-ink-700 font-medium">
            Proofs ({proofs.length} synced)
          </p>
          <SyncProofsButton orderId={order.id} />
          {proofs.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {proofs.slice(0, 12).map((proof) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={proof.id}
                  src={proof.thumbUrl ?? undefined}
                  alt={proof.fileName}
                  className="aspect-square object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {order.deliveryDriveLink && (
        <div className="flex flex-col gap-3 border-t border-ink-100 pt-6">
          <p className="text-sm text-ink-700 font-medium">
            Delivery gallery ({deliveryPhotos.length} synced)
          </p>
          <SyncDeliveryButton orderId={order.id} />
          {deliveryPhotos.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {deliveryPhotos.slice(0, 12).map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.thumbUrl ?? undefined}
                  alt={photo.fileName}
                  className="aspect-square object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {latestExport && (
        <div className="flex flex-col gap-2 border-t border-ink-100 pt-6">
          <p className="text-sm text-ink-700 font-medium">
            Selection results — {latestExport.data.count} photo{latestExport.data.count === 1 ? "" : "s"}
          </p>
          <ul className="text-sm text-ink-500 list-disc list-inside max-h-40 overflow-y-auto">
            {latestExport.data.selectedFileNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <a href={latestExport.downloadUrl} className="text-sm text-accent-600">
              Download CSV (link expires in 15 min)
            </a>
            {order.status === "selection_completed" && <ReopenSelectionButton orderId={order.id} />}
          </div>
        </div>
      )}
    </div>
  );
}
