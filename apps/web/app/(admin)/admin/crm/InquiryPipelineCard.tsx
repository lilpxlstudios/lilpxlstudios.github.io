"use client";

import { useActionState } from "react";
import { updateInquiryStatus, updateInquiryNotes, type FormState } from "@/lib/actions/marketing";
import type { Inquiry, InquiryStatus } from "@lps/shared";

const initialState: FormState = { status: "idle" };
const STAGES: InquiryStatus[] = ["new", "contacted", "quoted", "booked", "lost"];

function toDateInputValue(timestamp: number | null): string {
  if (!timestamp) return "";
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function InquiryPipelineCard({ inquiry }: { inquiry: Inquiry }) {
  const boundStatusAction = updateInquiryStatus.bind(null, inquiry.id);
  const [statusState, statusAction, statusPending] = useActionState(boundStatusAction, initialState);

  const boundNotesAction = updateInquiryNotes.bind(null, inquiry.id);
  const [notesState, notesAction, notesPending] = useActionState(boundNotesAction, initialState);

  return (
    <li className="px-4 py-3 flex flex-col gap-3">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="font-medium">
            {inquiry.name} <span className="text-ink-500 font-normal">— {inquiry.email}</span>
          </p>
          {inquiry.phone && <p className="text-sm text-ink-500">{inquiry.phone}</p>}
          {inquiry.shootTypeInterest && (
            <p className="text-sm text-ink-500">Interested in: {inquiry.shootTypeInterest}</p>
          )}
        </div>
        <p className="text-sm text-ink-500 shrink-0">
          {new Date(inquiry.submittedAt).toLocaleDateString()}
        </p>
      </div>
      <p className="text-sm text-ink-700">{inquiry.message}</p>

      <form action={statusAction} className="flex items-center gap-2">
        <select
          name="status"
          defaultValue={inquiry.status}
          className="border border-ink-100 rounded-md px-3 py-2 text-sm"
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={statusPending}
          className="bg-ink-900 text-paper-50 rounded-md px-3 py-2 text-sm disabled:opacity-50"
        >
          {statusPending ? "Saving…" : "Move stage"}
        </button>
        {statusState.status === "error" && <p className="text-sm text-danger-500">{statusState.message}</p>}
      </form>

      <form action={notesAction} className="flex flex-col gap-2">
        <textarea
          name="notes"
          defaultValue={inquiry.notes ?? ""}
          placeholder="Notes…"
          rows={2}
          className="border border-ink-100 rounded-md px-3 py-2 text-sm"
        />
        <div className="flex items-center gap-2">
          <label className="text-sm text-ink-500" htmlFor={`followUpAt-${inquiry.id}`}>
            Follow up
          </label>
          <input
            id={`followUpAt-${inquiry.id}`}
            type="date"
            name="followUpAt"
            defaultValue={toDateInputValue(inquiry.followUpAt)}
            className="border border-ink-100 rounded-md px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={notesPending}
            className="bg-ink-900 text-paper-50 rounded-md px-3 py-2 text-sm disabled:opacity-50"
          >
            {notesPending ? "Saving…" : "Save notes"}
          </button>
        </div>
        {notesState.status === "error" && <p className="text-sm text-danger-500">{notesState.message}</p>}
      </form>
    </li>
  );
}
