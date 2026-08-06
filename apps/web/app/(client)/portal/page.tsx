import Link from "next/link";
import { requireSession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import type { Order } from "@lps/shared";

async function getOrders(clientUid: string): Promise<Order[]> {
  const snap = await adminDb
    .collection("orders")
    .where("clientUid", "==", clientUid)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((doc) => doc.data() as Order);
}

export default async function PortalPage() {
  const session = await requireSession();
  const orders = await getOrders(session.uid);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl">Welcome back</h1>
        <p className="text-ink-500">
          Your orders, photo selection, and invoices will appear here once your
          studio sets up your first shoot.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl">Your shoots</h1>
      <ul className="flex flex-col divide-y divide-ink-100 border border-ink-100 rounded-md">
        {orders.map((order) => (
          <li key={order.id} className="px-4 py-3 flex justify-between items-center">
            <div>
              <p>{order.shootType}</p>
              <p className="text-sm text-ink-500">
                {new Date(order.shootDate).toLocaleDateString()} · {order.status.replace(/_/g, " ")}
              </p>
            </div>
            <Link href={`/portal/orders/${order.id}`} className="text-sm text-accent-600">
              Open →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
