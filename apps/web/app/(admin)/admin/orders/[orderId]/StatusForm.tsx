"use client";

import { useActionState } from "react";
import { updateOrderStatus, type FormState } from "@/lib/actions/orders";
import type { OrderStatus } from "@lps/shared";

const initialState: FormState = { status: "idle" };

export function StatusForm({ orderId, nextStatuses }: { orderId: string; nextStatuses: OrderStatus[] }) {
  const boundAction = updateOrderStatus.bind(null, orderId);
  const [state, action, pending] = useActionState(boundAction, initialState);

  if (nextStatuses.length === 0) {
    return <p className="text-sm text-ink-500">No further transitions available.</p>;
  }

  return (
    <form action={action} className="flex items-center gap-2">
      <select name="status" className="border border-ink-100 rounded-md px-3 py-2 text-sm">
        {nextStatuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="bg-ink-900 text-paper-50 rounded-md px-3 py-2 text-sm disabled:opacity-50"
      >
        {pending ? "Updating…" : "Move to status"}
      </button>
      {state.status === "error" && <p className="text-sm text-danger-500">{state.message}</p>}
    </form>
  );
}
