import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import type { Order } from "@lps/shared";

async function getRecentOrders(): Promise<Order[]> {
  const snap = await adminDb.collection("orders").orderBy("createdAt", "desc").limit(10).get();
  return snap.docs.map((doc) => doc.data() as Order);
}

async function getCounts() {
  const [clients, orders] = await Promise.all([
    adminDb.collection("users").where("role", "==", "client").count().get(),
    adminDb.collection("orders").count().get(),
  ]);
  return { clients: clients.data().count, orders: orders.data().count };
}

async function getOrdersNeedingAttention(): Promise<Order[]> {
  const snap = await adminDb.collection("orders").where("status", "==", "selection_completed").get();
  return snap.docs.map((doc) => doc.data() as Order);
}

// Extension point for future internal tools: add an entry here and build the
// route under app/(admin)/admin/<key>/ — no auth/routing wiring needed since
// AdminLayout already gates everything under /admin.
const ADMIN_APPS = [
  { key: "crm", label: "CRM", description: "Leads & inquiries pipeline", href: "/admin/crm" },
  { key: "billing", label: "Billing", description: "Invoices, payments, revenue", href: "/admin/billing" },
  { key: "clients", label: "Clients", description: "Client roster & orders", href: "/admin/clients" },
] as const;

export default async function AdminDashboardPage() {
  const [orders, counts, needsAttention] = await Promise.all([
    getRecentOrders(),
    getCounts(),
    getOrdersNeedingAttention(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ADMIN_APPS.map((app) => (
          <Link
            key={app.key}
            href={app.href}
            className="flex flex-col gap-1 rounded-lg border border-ink-100 px-4 py-4 transition hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-sm"
          >
            <span className="font-medium text-ink-900">{app.label}</span>
            <span className="text-sm text-ink-500">{app.description}</span>
          </Link>
        ))}
      </div>

      <div className="flex gap-8">
        <div>
          <p className="text-3xl">{counts.clients}</p>
          <p className="text-sm text-ink-500">Clients</p>
        </div>
        <div>
          <p className="text-3xl">{counts.orders}</p>
          <p className="text-sm text-ink-500">Orders</p>
        </div>
      </div>

      {needsAttention.length > 0 && (
        <div>
          <h2 className="text-lg mb-1">Needs attention</h2>
          <p className="text-sm text-ink-500 mb-3">
            Clients who finished picking their photos. (Email alerts for this land in a later milestone —
            check back here for now.)
          </p>
          <ul className="flex flex-col divide-y divide-warning-500/30 border border-warning-500/40 rounded-md">
            {needsAttention.map((order) => (
              <li key={order.id} className="px-4 py-3 flex justify-between items-center">
                <div>
                  <p>
                    {order.clientName} — {order.shootType}
                  </p>
                  <p className="text-sm text-ink-500">
                    Selected {order.selectionState.selectedCount} of {order.selectionState.totalCount}
                  </p>
                </div>
                <Link href={`/admin/orders/${order.id}`} className="text-sm text-accent-600">
                  Review →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className="text-lg mb-3">Recent orders</h2>
        {orders.length === 0 ? (
          <p className="text-ink-500 text-sm">No orders yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-ink-100 border border-ink-100 rounded-md">
            {orders.map((order) => (
              <li key={order.id} className="px-4 py-3 flex justify-between items-center">
                <div>
                  <p>
                    {order.clientName} — {order.shootType}
                  </p>
                  <p className="text-sm text-ink-500">{order.status}</p>
                </div>
                <Link href={`/admin/orders/${order.id}`} className="text-sm text-accent-600">
                  Open →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
