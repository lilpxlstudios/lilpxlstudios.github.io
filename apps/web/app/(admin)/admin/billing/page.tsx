import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import type { Invoice, Payment } from "@lps/shared";

async function getOutstanding(): Promise<number> {
  const snap = await adminDb
    .collection("orders")
    .where("status", "in", ["payment_pending", "invoiced"])
    .get();
  return snap.docs.reduce((sum, doc) => sum + (doc.data().amountDue ?? 0), 0);
}

async function getCollected(): Promise<number> {
  const snap = await adminDb.collection("payments").where("status", "==", "paid").get();
  return snap.docs.reduce((sum, doc) => sum + (doc.data().amount ?? 0), 0);
}

async function getInvoiceCount(): Promise<number> {
  const snap = await adminDb.collection("invoices").count().get();
  return snap.data().count;
}

async function getRecentInvoices(): Promise<Invoice[]> {
  const snap = await adminDb.collection("invoices").orderBy("issuedAt", "desc").limit(10).get();
  return snap.docs.map((doc) => ({ ...(doc.data() as Omit<Invoice, "id">), id: doc.id }));
}

async function getRecentPayments(): Promise<Payment[]> {
  const snap = await adminDb.collection("payments").orderBy("createdAt", "desc").limit(10).get();
  return snap.docs.map((doc) => ({ ...(doc.data() as Omit<Payment, "id">), id: doc.id }));
}

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default async function BillingPage() {
  const [outstanding, collected, invoiceCount, invoices, payments] = await Promise.all([
    getOutstanding(),
    getCollected(),
    getInvoiceCount(),
    getRecentInvoices(),
    getRecentPayments(),
  ]);

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <h1 className="text-2xl">Billing</h1>

      <div className="flex gap-8">
        <div>
          <p className="text-3xl">{formatInr(outstanding)}</p>
          <p className="text-sm text-ink-500">Outstanding</p>
        </div>
        <div>
          <p className="text-3xl">{formatInr(collected)}</p>
          <p className="text-sm text-ink-500">Collected</p>
        </div>
        <div>
          <p className="text-3xl">{invoiceCount}</p>
          <p className="text-sm text-ink-500">Invoices issued</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg mb-3">Recent invoices</h2>
        {invoices.length === 0 ? (
          <p className="text-ink-500 text-sm">No invoices yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-ink-100 border border-ink-100 rounded-md">
            {invoices.map((invoice) => (
              <li key={invoice.id} className="px-4 py-3 flex justify-between items-center">
                <div>
                  <p>{invoice.invoiceNumber}</p>
                  <p className="text-sm text-ink-500">
                    {formatInr(invoice.total)} — {invoice.status}
                  </p>
                </div>
                <Link href={`/admin/orders/${invoice.orderId}`} className="text-sm text-accent-600">
                  Open order →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-lg mb-3">Recent payments</h2>
        {payments.length === 0 ? (
          <p className="text-ink-500 text-sm">No payments yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-ink-100 border border-ink-100 rounded-md">
            {payments.map((payment) => (
              <li key={payment.id} className="px-4 py-3 flex justify-between items-center">
                <div>
                  <p>
                    {formatInr(payment.amount)} — {payment.purpose}
                  </p>
                  <p className="text-sm text-ink-500">{payment.status}</p>
                </div>
                <Link href={`/admin/orders/${payment.orderId}`} className="text-sm text-accent-600">
                  Open order →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
