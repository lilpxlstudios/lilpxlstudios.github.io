"use client";

import { useActionState } from "react";
import { syncProofsFromDrive, type SyncProofsState } from "@/lib/actions/proofs";

const initialState: SyncProofsState = { status: "idle" };

export function SyncProofsButton({ orderId }: { orderId: string }) {
  const boundAction = syncProofsFromDrive.bind(null, orderId);
  const [state, action, pending] = useActionState(boundAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-2 items-start">
      <button
        type="submit"
        disabled={pending}
        className="bg-ink-900 text-paper-50 rounded-md px-3 py-2 text-sm disabled:opacity-50"
      >
        {pending ? "Syncing…" : "Sync proofs from Drive"}
      </button>
      {state.status === "error" && <p className="text-sm text-danger-500">{state.message}</p>}
      {state.status === "success" && (
        <p className="text-sm text-success-500">
          Synced. {state.total} proofs total.
        </p>
      )}
    </form>
  );
}
