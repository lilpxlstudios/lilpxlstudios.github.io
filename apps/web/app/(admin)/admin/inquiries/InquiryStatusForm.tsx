"use client";

import { useActionState } from "react";
import { updateInquiryStatus, type FormState } from "@/lib/actions/marketing";
import type { Inquiry } from "@lps/shared";

const initialState: FormState = { status: "idle" };
const STATUSES: Inquiry["status"][] = ["new", "responded", "converted"];

export function InquiryStatusForm({ inquiryId, status }: { inquiryId: string; status: Inquiry["status"] }) {
  const boundAction = updateInquiryStatus.bind(null, inquiryId);
  const [state, action, pending] = useActionState(boundAction, initialState);

  return (
    <form action={action} className="flex items-center gap-2">
      <select name="status" defaultValue={status} className="border border-ink-100 rounded-md px-3 py-2 text-sm">
        {STATUSES.map((s) => (
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
        {pending ? "Saving…" : "Save"}
      </button>
      {state.status === "error" && <p className="text-sm text-danger-500">{state.message}</p>}
    </form>
  );
}
