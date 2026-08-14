import { z } from "zod";

export const taxInvoiceLineItemSchema = z.object({
  description: z.string(),
  hsnSac: z.string(),
  qty: z.number().positive(),
  rate: z.number().nonnegative(),
  amount: z.number().nonnegative(),
});
export type TaxInvoiceLineItem = z.infer<typeof taxInvoiceLineItemSchema>;

export const taxInvoiceSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  clientUid: z.string().nullable().default(null),
  billToName: z.string(),
  billToAddress: z.string().nullable().default(null),
  placeOfSupply: z.string(),
  lineItems: z.array(taxInvoiceLineItemSchema),
  subtotal: z.number(),
  cgstRate: z.number(),
  cgstAmount: z.number(),
  sgstRate: z.number(),
  sgstAmount: z.number(),
  total: z.number(),
  amountPaid: z.number().default(0),
  balanceDue: z.number(),
  currency: z.literal("INR").default("INR"),
  terms: z.string().default("Due on Receipt"),
  notes: z.string().nullable().default(null),
  pdfStoragePath: z.string().nullable().default(null),
  issuedAt: z.number(),
  issuedBy: z.string(),
});
export type TaxInvoice = z.infer<typeof taxInvoiceSchema>;
