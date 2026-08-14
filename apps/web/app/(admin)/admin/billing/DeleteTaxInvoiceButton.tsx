"use client";

import { useActionState } from "react";
import { deleteTaxInvoice, type DeleteTaxInvoiceState } from "@/lib/actions/taxInvoices";

const initialState: DeleteTaxInvoiceState = { status: "idle" };

export function DeleteTaxInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const boundAction = deleteTaxInvoice.bind(null, invoiceId);
  const [state, action, pending] = useActionState(boundAction, initialState);

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <button type="submit" disabled={pending} className="text-sm text-danger-500 disabled:opacity-50">
        {pending ? "Deleting…" : "Delete"}
      </button>
      {state.status === "error" && <p className="text-xs text-danger-500">{state.message}</p>}
    </form>
  );
}
