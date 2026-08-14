import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import type { User } from "@lps/shared";
import { NewClientForm } from "./NewClientForm";
import { DeleteClientButton, RestoreClientButton } from "./ClientRowActions";

const RESTORE_WINDOW_DAYS = 60;

async function getClients(): Promise<User[]> {
  const snap = await adminDb.collection("users").where("role", "==", "client").get();
  return snap.docs.map((doc) => doc.data() as User);
}

function daysRemaining(deletedAt: number): number {
  const daysSince = Math.floor((Date.now() - deletedAt) / (24 * 60 * 60 * 1000));
  return Math.max(0, RESTORE_WINDOW_DAYS - daysSince);
}

export default async function ClientsPage() {
  const clients = await getClients();
  const active = clients.filter((c) => !c.deletedAt);
  const trashed = clients.filter((c) => c.deletedAt);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl mb-4">New client</h1>
        <NewClientForm />
      </div>

      <div>
        <h2 className="text-lg mb-3">All clients ({active.length})</h2>
        {active.length === 0 ? (
          <p className="text-ink-500 text-sm">No clients yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-ink-100 border border-ink-100 rounded-md">
            {active.map((client) => (
              <li key={client.uid} className="px-4 py-3 flex justify-between items-center gap-4">
                <div>
                  <p>{client.displayName}</p>
                  <p className="text-sm text-ink-500">{client.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Link href={`/admin/clients/${client.uid}`} className="text-sm text-accent-600">
                    View orders →
                  </Link>
                  <div className="flex flex-col items-end">
                    <DeleteClientButton uid={client.uid} />
                    <p className="text-xs text-ink-500">Disables portal login. Restorable for 60 days.</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {trashed.length > 0 && (
        <div>
          <h2 className="text-lg mb-3">Recently deleted</h2>
          <ul className="flex flex-col divide-y divide-warning-500/30 border border-warning-500/40 rounded-md">
            {trashed.map((client) => (
              <li key={client.uid} className="px-4 py-3 flex justify-between items-center gap-4">
                <div>
                  <p>{client.displayName}</p>
                  <p className="text-sm text-ink-500">
                    {client.email} — {daysRemaining(client.deletedAt!)} day
                    {daysRemaining(client.deletedAt!) === 1 ? "" : "s"} left to restore
                  </p>
                </div>
                <RestoreClientButton uid={client.uid} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
