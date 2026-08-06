import Link from "next/link";
import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import type { Order, User } from "@lps/shared";
import { NewOrderForm } from "./NewOrderForm";

async function getClient(uid: string): Promise<User | null> {
  const snap = await adminDb.collection("users").doc(uid).get();
  return snap.exists ? (snap.data() as User) : null;
}

async function getOrders(clientUid: string): Promise<Order[]> {
  const snap = await adminDb
    .collection("orders")
    .where("clientUid", "==", clientUid)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((doc) => doc.data() as Order);
}

export default async function ClientDetailPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  const client = await getClient(uid);
  if (!client) notFound();

  const orders = await getOrders(uid);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/clients" className="text-sm text-ink-500">
          ← All clients
        </Link>
        <h1 className="text-2xl mt-2">{client.displayName}</h1>
        <p className="text-ink-500 text-sm">
          {client.email}
          {client.phone ? ` · ${client.phone}` : ""}
        </p>
      </div>

      <div>
        <h2 className="text-lg mb-3">Orders ({orders.length})</h2>
        {orders.length === 0 ? (
          <p className="text-ink-500 text-sm mb-4">No orders yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-ink-100 border border-ink-100 rounded-md mb-6">
            {orders.map((order) => (
              <li key={order.id} className="px-4 py-3 flex justify-between items-center">
                <div>
                  <p>{order.shootType}</p>
                  <p className="text-sm text-ink-500">
                    {new Date(order.shootDate).toLocaleDateString()} · {order.status}
                  </p>
                </div>
                <Link href={`/admin/orders/${order.id}`} className="text-sm text-accent-600">
                  Open →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-lg mb-3">New order</h2>
        <NewOrderForm clientUid={client.uid} clientName={client.displayName} clientEmail={client.email} />
      </div>
    </div>
  );
}
