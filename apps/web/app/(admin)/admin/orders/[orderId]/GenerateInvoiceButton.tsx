"use client";

import { useActionState } from "react";
import { generateInvoice, type GenerateInvoiceState } from "@/lib/actions/invoices";

const initialState: GenerateInvoiceState = { status: "idle" };

export function GenerateInvoiceButton({ orderId }: { orderId: string }) {
  const boundAction = generateInvoice.bind(null, orderId);
  const [state, action, pending] = useActionState(boundAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-2 items-start">
      <button
        type="submit"
        disabled={pending}
        className="bg-ink-900 text-paper-50 rounded-md px-3 py-2 text-sm disabled:opacity-50"
      >
        {pending ? "Generating…" : "Generate invoice"}
      </button>
      {state.status === "error" && <p className="text-sm text-danger-500">{state.message}</p>}
    </form>
  );
}
