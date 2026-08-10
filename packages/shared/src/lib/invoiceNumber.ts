// Format a sequential counter value into "LPS-2026-0001". The counter itself
// (per-year, allocated in a Firestore transaction) lives in
// apps/web/lib/actions/invoices.ts — this is the one place both that action and
// any UI preview must agree on the format.
export function formatInvoiceNumber(year: number, sequence: number): string {
  return `LPS-${year}-${String(sequence).padStart(4, "0")}`;
}
