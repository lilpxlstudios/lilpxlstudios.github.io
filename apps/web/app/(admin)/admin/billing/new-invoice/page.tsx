import { adminDb } from "@/lib/firebase/admin";
import type { User } from "@lps/shared";
import { NewTaxInvoiceForm } from "./NewTaxInvoiceForm";

async function getActiveClients(): Promise<User[]> {
  const snap = await adminDb.collection("users").where("role", "==", "client").get();
  return snap.docs.map((doc) => doc.data() as User).filter((user) => !user.deletedAt);
}

export default async function NewInvoicePage() {
  const clients = await getActiveClients();

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-2xl">New tax invoice</h1>
      <NewTaxInvoiceForm clients={clients} />
    </div>
  );
}
