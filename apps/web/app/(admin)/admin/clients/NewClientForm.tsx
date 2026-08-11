"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createClient, type CreateClientState } from "@/lib/actions/clients";
import { PACKAGE_OPTIONS } from "@lps/shared";

const initialState: CreateClientState = { status: "idle" };

export function NewClientForm() {
  const [state, action, pending] = useActionState(createClient, initialState);
  const [copied, setCopied] = useState(false);

  if (state.status === "success") {
    return (
      <div className="border border-success-500 rounded-md p-4 flex flex-col gap-3">
        <p className="text-sm">
          Client account and order created for <strong>{state.email}</strong>.
        </p>
        <p className="text-sm">
          {state.emailSent
            ? "A first-login email with their password-setup link has been sent."
            : "Email sending isn't configured yet — copy this link and send it to them yourself:"}
        </p>
        <code className="text-xs bg-ink-100 rounded p-2 break-all">{state.resetLink}</code>
        <div className="flex gap-3">
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
          <Link
            href={`/admin/orders/${state.orderId}`}
            className="self-start text-sm text-accent-600 underline"
          >
            View order →
          </Link>
        </div>
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

      <div className="mt-2 border-t border-ink-100 pt-3">
        <p className="text-sm text-ink-700 font-medium mb-3">First shoot</p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="shootType" className="text-sm text-ink-700">
              Package
            </label>
            <select
              id="shootType"
              name="shootType"
              required
              defaultValue=""
              className="border border-ink-100 rounded-md px-3 py-2"
            >
              <option value="" disabled>
                Select a package
              </option>
              {PACKAGE_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
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
        </div>
      </div>

      {state.status === "error" && <p className="text-sm text-danger-500">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start bg-ink-900 text-paper-50 rounded-md px-4 py-2 disabled:opacity-50 mt-2"
      >
        {pending ? "Creating…" : "Create client & order"}
      </button>
    </form>
  );
}
