"use client";

import { useActionState, useState } from "react";
import { createClient, type CreateClientState } from "@/lib/actions/clients";

const initialState: CreateClientState = { status: "idle" };

export function NewClientForm() {
  const [state, action, pending] = useActionState(createClient, initialState);
  const [copied, setCopied] = useState(false);

  if (state.status === "success") {
    return (
      <div className="border border-success-500 rounded-md p-4 flex flex-col gap-3">
        <p className="text-sm">
          Client account created for <strong>{state.email}</strong>. Send them
          this first-login link (there&apos;s no automated email yet — that
          lands in M6):
        </p>
        <code className="text-xs bg-ink-100 rounded p-2 break-all">{state.resetLink}</code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(state.resetLink);
            setCopied(true);
          }}
          className="self-start text-sm bg-ink-900 text-paper-50 rounded-md px-3 py-1.5"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3 max-w-md">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm text-ink-700">
          Full name
        </label>
        <input id="name" name="name" required className="border border-ink-100 rounded-md px-3 py-2" />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm text-ink-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="border border-ink-100 rounded-md px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-sm text-ink-700">
          Phone (optional)
        </label>
        <input id="phone" name="phone" className="border border-ink-100 rounded-md px-3 py-2" />
      </div>
      {state.status === "error" && <p className="text-sm text-danger-500">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start bg-ink-900 text-paper-50 rounded-md px-4 py-2 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create client"}
      </button>
    </form>
  );
}
