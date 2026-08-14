"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createTaxInvoice, type CreateTaxInvoiceState } from "@/lib/actions/taxInvoices";
import type { User } from "@lps/shared";

const initialState: CreateTaxInvoiceState = { status: "idle" };
const ONE_OFF_VALUE = "";

type LineItemRow = { description: string; hsnSac: string; qty: string; rate: string };

function newRow(): LineItemRow {
  return { description: "Photography", hsnSac: "998387", qty: "1", rate: "" };
}

export function NewTaxInvoiceForm({ clients }: { clients: User[] }) {
  const [state, action, pending] = useActionState(createTaxInvoice, initialState);
  const [clientUid, setClientUid] = useState(ONE_OFF_VALUE);
  const [rows, setRows] = useState<LineItemRow[]>([newRow()]);

  function updateRow(index: number, field: keyof LineItemRow, value: string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  if (state.status === "success") {
    return (
      <div className="border border-success-500 rounded-md p-4 flex flex-col gap-3">
        <p className="text-sm">
          Tax invoice <strong>{state.invoiceNumber}</strong> generated.
        </p>
        <Link href="/admin/billing" className="self-start text-sm text-accent-600 underline">
          View in Billing →
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="clientUid" className="text-sm text-ink-700">
          Customer
        </label>
        <select
          id="clientUid"
          name="clientUid"
          value={clientUid}
          onChange={(e) => setClientUid(e.target.value)}
          className="border border-ink-100 rounded-md px-3 py-2"
        >
          <option value={ONE_OFF_VALUE}>— One-off customer —</option>
          {clients.map((client) => (
            <option key={client.uid} value={client.uid}>
              {client.displayName} — {client.email}
            </option>
          ))}
        </select>
      </div>

      {clientUid === ONE_OFF_VALUE && (
        <div className="flex flex-col gap-1">
          <label htmlFor="manualName" className="text-sm text-ink-700">
            Bill To name
          </label>
          <input id="manualName" name="manualName" className="border border-ink-100 rounded-md px-3 py-2" />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <label htmlFor="manualAddress" className="text-sm text-ink-700">
          Bill To address (optional)
        </label>
        <textarea
          id="manualAddress"
          name="manualAddress"
          rows={2}
          className="border border-ink-100 rounded-md px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="invoiceNumber" className="text-sm text-ink-700">
          Invoice number (optional — leave blank to auto-generate)
        </label>
        <input
          id="invoiceNumber"
          name="invoiceNumber"
          placeholder="e.g. INV-000079"
          className="border border-ink-100 rounded-md px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="placeOfSupply" className="text-sm text-ink-700">
            Place of supply
          </label>
          <input
            id="placeOfSupply"
            name="placeOfSupply"
            required
            defaultValue="Tamil Nadu (33)"
            className="border border-ink-100 rounded-md px-3 py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="terms" className="text-sm text-ink-700">
            Terms
          </label>
          <input
            id="terms"
            name="terms"
            required
            defaultValue="Due on Receipt"
            className="border border-ink-100 rounded-md px-3 py-2"
          />
        </div>
      </div>

      <div className="border-t border-ink-100 pt-3">
        <p className="text-sm text-ink-700 font-medium mb-3">Line items</p>
        <div className="flex flex-col gap-3">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-end">
              <div className="flex flex-col gap-1">
                {i === 0 && <label className="text-xs text-ink-500">Description</label>}
                <input
                  name="description"
                  value={row.description}
                  onChange={(e) => updateRow(i, "description", e.target.value)}
                  required
                  className="border border-ink-100 rounded-md px-2 py-1.5 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                {i === 0 && <label className="text-xs text-ink-500">HSN/SAC</label>}
                <input
                  name="hsnSac"
                  value={row.hsnSac}
                  onChange={(e) => updateRow(i, "hsnSac", e.target.value)}
                  required
                  className="border border-ink-100 rounded-md px-2 py-1.5 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                {i === 0 && <label className="text-xs text-ink-500">Qty</label>}
                <input
                  name="qty"
                  type="number"
                  min="0"
                  step="0.01"
                  value={row.qty}
                  onChange={(e) => updateRow(i, "qty", e.target.value)}
                  required
                  className="border border-ink-100 rounded-md px-2 py-1.5 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                {i === 0 && <label className="text-xs text-ink-500">Rate</label>}
                <input
                  name="rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={row.rate}
                  onChange={(e) => updateRow(i, "rate", e.target.value)}
                  required
                  className="border border-ink-100 rounded-md px-2 py-1.5 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                disabled={rows.length === 1}
                className="text-sm text-danger-500 disabled:opacity-30 py-1.5"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, newRow()])}
          className="mt-3 text-sm text-accent-600"
        >
          + Add line item
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 border-t border-ink-100 pt-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="cgstRate" className="text-sm text-ink-700">
            CGST %
          </label>
          <input
            id="cgstRate"
            name="cgstRate"
            type="number"
            min="0"
            step="0.01"
            defaultValue="9"
            className="border border-ink-100 rounded-md px-3 py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="sgstRate" className="text-sm text-ink-700">
            SGST %
          </label>
          <input
            id="sgstRate"
            name="sgstRate"
            type="number"
            min="0"
            step="0.01"
            defaultValue="9"
            className="border border-ink-100 rounded-md px-3 py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="amountPaid" className="text-sm text-ink-700">
            Payment made (₹)
          </label>
          <input
            id="amountPaid"
            name="amountPaid"
            type="number"
            min="0"
            step="0.01"
            defaultValue="0"
            className="border border-ink-100 rounded-md px-3 py-2"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm text-ink-700">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue="Thanks for your business."
          className="border border-ink-100 rounded-md px-3 py-2"
        />
      </div>

      {state.status === "error" && <p className="text-sm text-danger-500">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start bg-ink-900 text-paper-50 rounded-md px-4 py-2 disabled:opacity-50"
      >
        {pending ? "Generating…" : "Generate invoice"}
      </button>
    </form>
  );
}
