"use client";

import { useActionState } from "react";
import { deleteClient, restoreClient, type ClientActionState } from "@/lib/actions/clients";

const initialState: ClientActionState = { status: "idle" };

export function DeleteClientButton({ uid }: { uid: string }) {
  const boundAction = deleteClient.bind(null, uid);
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

export function RestoreClientButton({ uid }: { uid: string }) {
  const boundAction = restoreClient.bind(null, uid);
  const [state, action, pending] = useActionState(boundAction, initialState);

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <button type="submit" disabled={pending} className="text-sm text-accent-600 disabled:opacity-50">
        {pending ? "Restoring…" : "Restore"}
      </button>
      {state.status === "error" && <p className="text-xs text-danger-500">{state.message}</p>}
    </form>
  );
}
