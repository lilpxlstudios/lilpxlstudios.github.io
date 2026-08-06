"use client";

import { useActionState } from "react";
import { createOrder, type FormState } from "@/lib/actions/orders";

const initialState: FormState = { status: "idle" };

export function NewOrderForm({
  clientUid,
  clientName,
  clientEmail,
}: {
  clientUid: string;
  clientName: string;
  clientEmail: string;
}) {
  const boundAction = createOrder.bind(null, clientUid, clientName, clientEmail);
  const [state, action, pending] = useActionState(boundAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-3 max-w-md">
      <div className="flex flex-col gap-1">
        <label htmlFor="shootType" className="text-sm text-ink-700">
          Shoot type
        </label>
        <input
          id="shootType"
          name="shootType"
          placeholder="Wedding, portrait, event…"
          required
          className="border border-ink-100 rounded-md px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="shootDate" className="text-sm text-ink-700">
          Shoot date
        </label>
        <input
          id="shootDate"
          name="shootDate"
          type="date"
          required
          className="border border-ink-100 rounded-md px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="amountDue" className="text-sm text-ink-700">
          Amount due (₹, optional — can set later)
        </label>
        <input
          id="amountDue"
          name="amountDue"
          type="number"
          min="0"
          step="1"
          className="border border-ink-100 rounded-md px-3 py-2"
        />
      </div>
      {state.status === "error" && <p className="text-sm text-danger-500">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start bg-ink-900 text-paper-50 rounded-md px-4 py-2 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create order"}
      </button>
    </form>
  );
}
