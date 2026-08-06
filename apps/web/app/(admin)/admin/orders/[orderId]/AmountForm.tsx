"use client";

import { useActionState } from "react";
import { updateAmountDue, type FormState } from "@/lib/actions/orders";

const initialState: FormState = { status: "idle" };

export function AmountForm({ orderId, amountDue }: { orderId: string; amountDue: number }) {
  const boundAction = updateAmountDue.bind(null, orderId);
  const [state, action, pending] = useActionState(boundAction, initialState);

  return (
    <form action={action} className="flex items-center gap-2">
      <input
        name="amountDue"
        type="number"
        min="0"
        step="1"
        defaultValue={amountDue}
        className="border border-ink-100 rounded-md px-3 py-2 text-sm w-32"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-ink-900 text-paper-50 rounded-md px-3 py-2 text-sm disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save amount"}
      </button>
      {state.status === "error" && <p className="text-sm text-danger-500">{state.message}</p>}
    </form>
  );
}
