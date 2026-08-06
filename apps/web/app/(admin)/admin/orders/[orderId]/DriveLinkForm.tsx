"use client";

import { useActionState } from "react";
import { attachDriveLink, type DriveLinkState } from "@/lib/actions/orders";
import type { DriveLink } from "@lps/shared";

const initialState: DriveLinkState = { status: "idle" };

export function DriveLinkForm({
  orderId,
  linkType,
  label,
  existing,
}: {
  orderId: string;
  linkType: "proofs" | "delivery";
  label: string;
  existing: DriveLink | null;
}) {
  const boundAction = attachDriveLink.bind(null, orderId, linkType);
  const [state, action, pending] = useActionState(boundAction, initialState);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-ink-700 font-medium">{label}</p>
      {existing && (
        <a
          href={existing.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-accent-600 break-all"
        >
          {existing.url}
        </a>
      )}
      <form action={action} className="flex gap-2">
        <input
          name="url"
          placeholder="Paste Google Drive folder link"
          className="flex-1 border border-ink-100 rounded-md px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-ink-900 text-paper-50 rounded-md px-3 py-2 text-sm disabled:opacity-50"
        >
          {pending ? "Checking…" : existing ? "Replace" : "Attach"}
        </button>
      </form>
      {state.status === "error" && <p className="text-sm text-danger-500">{state.message}</p>}
      {state.status === "success" && (
        <p className="text-sm text-success-500">Linked to “{state.folderName}”.</p>
      )}
    </div>
  );
}
