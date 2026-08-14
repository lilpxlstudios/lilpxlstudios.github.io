// Format a sequential counter value into "INV-000079". Continues the studio's
// pre-existing external invoice numbering (last used: INV-000078) rather than
// starting a new series — see scripts/seedTaxInvoiceCounter.ts. The counter
// itself (a single continuous sequence, not per-year) lives in
// apps/web/lib/actions/taxInvoices.ts.
export function formatTaxInvoiceNumber(sequence: number): string {
  return `INV-${String(sequence).padStart(6, "0")}`;
}
