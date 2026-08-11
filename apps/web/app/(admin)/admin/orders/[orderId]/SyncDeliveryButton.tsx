"use client";

import { useActionState } from "react";
import { syncDeliveryPhotosFromDrive, type SyncDeliveryPhotosState } from "@/lib/actions/gallery";

const initialState: SyncDeliveryPhotosState = { status: "idle" };

export function SyncDeliveryButton({ orderId }: { orderId: string }) {
  const boundAction = syncDeliveryPhotosFromDrive.bind(null, orderId);
  const [state, action, pending] = useActionState(boundAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-2 items-start">
      <button
        type="submit"
        disabled={pending}
        className="bg-ink-900 text-paper-50 rounded-md px-3 py-2 text-sm disabled:opacity-50"
      >
        {pending ? "Syncing…" : "Sync delivery gallery from Drive"}
      </button>
      {state.status === "error" && <p className="text-sm text-danger-500">{state.message}</p>}
      {state.status === "success" && (
        <p className="text-sm text-success-500">Synced. {state.total} photos total.</p>
      )}
    </form>
  );
}
