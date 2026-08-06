import { z } from "zod";

export const paymentStatusSchema = z.enum(["created", "paid", "failed", "refunded"]);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const paymentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  clientUid: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string().nullable().default(null),
  razorpaySignature: z.string().nullable().default(null),
  amount: z.number().positive(),
  currency: z.literal("INR").default("INR"),
  purpose: z.enum(["deposit", "balance", "full"]),
  status: paymentStatusSchema,
  createdAt: z.number(),
  verifiedAt: z.number().nullable().default(null),
});
export type Payment = z.infer<typeof paymentSchema>;

export const invoiceLineItemSchema = z.object({
  description: z.string(),
  amount: z.number(),
});

export const invoiceSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  clientUid: z.string(),
  invoiceNumber: z.string(),
  lineItems: z.array(invoiceLineItemSchema),
  subtotal: z.number(),
  tax: z.number().default(0),
  total: z.number(),
  currency: z.literal("INR").default("INR"),
  status: z.enum(["draft", "issued"]),
  pdfStoragePath: z.string().nullable().default(null),
  relatedPaymentId: z.string().nullable().default(null),
  issuedAt: z.number().nullable().default(null),
  dueDate: z.number().nullable().default(null),
});
export type Invoice = z.infer<typeof invoiceSchema>;
