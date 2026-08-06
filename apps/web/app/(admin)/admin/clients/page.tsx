import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import type { User } from "@lps/shared";
import { NewClientForm } from "./NewClientForm";

async function getClients(): Promise<User[]> {
  const snap = await adminDb.collection("users").where("role", "==", "client").get();
  return snap.docs.map((doc) => doc.data() as User);
}

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl mb-4">New client</h1>
        <NewClientForm />
      </div>

      <div>
        <h2 className="text-lg mb-3">All clients ({clients.length})</h2>
        {clients.length === 0 ? (
          <p className="text-ink-500 text-sm">No clients yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-ink-100 border border-ink-100 rounded-md">
            {clients.map((client) => (
              <li key={client.uid} className="px-4 py-3 flex justify-between items-center">
                <div>
                  <p>{client.displayName}</p>
                  <p className="text-sm text-ink-500">{client.email}</p>
                </div>
                <Link href={`/admin/clients/${client.uid}`} className="text-sm text-accent-600">
                  View orders →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
