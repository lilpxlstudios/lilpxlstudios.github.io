"use client";

import { useState, useTransition } from "react";
import { reopenSelection } from "@/lib/actions/selection";

export function ReopenSelectionButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1 items-start">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await reopenSelection(orderId);
            setError(result.status === "error" ? result.message : null);
          })
        }
        className="text-sm border border-ink-100 rounded-md px-3 py-1.5 disabled:opacity-50"
      >
        {isPending ? "Reopening…" : "Reopen selection"}
      </button>
      {error && <p className="text-sm text-danger-500">{error}</p>}
    </div>
  );
}
