"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { renderTaxInvoicePdf } from "@/lib/pdf/taxInvoice";
import { formatTaxInvoiceNumber } from "@lps/shared";
import type { TaxInvoice, TaxInvoiceLineItem, User } from "@lps/shared";

export type CreateTaxInvoiceState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; invoiceNumber: string };

// Single continuous counter (not per-year) — continues the studio's existing
// external invoice numbering. See scripts/seedTaxInvoiceCounter.ts.
async function nextTaxInvoiceSequence(): Promise<number> {
  const counterRef = adminDb.collection("counters").doc("taxInvoices");
  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const next = (snap.exists ? (snap.data()!.seq as number) : 0) + 1;
    tx.set(counterRef, { seq: next }, { merge: true });
    return next;
  });
}

const lineItemSchema = z.object({
  description: z.string().min(1),
  hsnSac: z.string().min(1),
  qty: z.coerce.number().positive(),
  rate: z.coerce.number().nonnegative(),
});

const createTaxInvoiceSchema = z.object({
  clientUid: z.string().optional(),
  manualName: z.string().optional(),
  manualAddress: z.string().optional(),
  invoiceNumber: z.string().optional(),
  placeOfSupply: z.string().min(1),
  terms: z.string().min(1),
  cgstRate: z.coerce.number().nonnegative(),
  sgstRate: z.coerce.number().nonnegative(),
  amountPaid: z.coerce.number().nonnegative().default(0),
  notes: z.string().optional(),
});

function collectLineItems(formData: FormData): { description: string; hsnSac: string; qty: number; rate: number }[] {
  const descriptions = formData.getAll("description");
  const hsnSacs = formData.getAll("hsnSac");
  const qtys = formData.getAll("qty");
  const rates = formData.getAll("rate");

  const items: { description: string; hsnSac: string; qty: number; rate: number }[] = [];
  for (let i = 0; i < descriptions.length; i++) {
    const parsed = lineItemSchema.safeParse({
      description: descriptions[i],
      hsnSac: hsnSacs[i],
      qty: qtys[i],
      rate: rates[i],
    });
    if (parsed.success) items.push(parsed.data);
  }
  return items;
}

export async function createTaxInvoice(
  _prevState: CreateTaxInvoiceState,
  formData: FormData
): Promise<CreateTaxInvoiceState> {
  const session = await requireAdmin();

  const parsed = createTaxInvoiceSchema.safeParse({
    clientUid: formData.get("clientUid") || undefined,
    manualName: formData.get("manualName") || undefined,
    manualAddress: formData.get("manualAddress") || undefined,
    invoiceNumber: formData.get("invoiceNumber") || undefined,
    placeOfSupply: formData.get("placeOfSupply"),
    terms: formData.get("terms"),
    cgstRate: formData.get("cgstRate"),
    sgstRate: formData.get("sgstRate"),
    amountPaid: formData.get("amountPaid") || 0,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]!.message };
  }
  const {
    clientUid,
    manualName,
    manualAddress,
    invoiceNumber: manualInvoiceNumber,
    placeOfSupply,
    terms,
    cgstRate,
    sgstRate,
    amountPaid,
    notes,
  } = parsed.data;

  const rawItems = collectLineItems(formData);
  if (rawItems.length === 0) {
    return { status: "error", message: "Add at least one line item." };
  }

  let billToName: string;
  let billToAddress: string | null = manualAddress ?? null;
  let resolvedClientUid: string | null = null;

  if (clientUid) {
    const userSnap = await adminDb.collection("users").doc(clientUid).get();
    if (!userSnap.exists) {
      return { status: "error", message: "Selected customer not found." };
    }
    const user = userSnap.data() as User;
    billToName = user.displayName;
    resolvedClientUid = clientUid;
  } else if (manualName) {
    billToName = manualName;
  } else {
    return { status: "error", message: "Select a customer or enter a one-off Bill To name." };
  }

  const lineItems: TaxInvoiceLineItem[] = rawItems.map((item) => ({
    description: item.description,
    hsnSac: item.hsnSac,
    qty: item.qty,
    rate: item.rate,
    amount: Math.round(item.qty * item.rate * 100) / 100,
  }));
  const subtotal = Math.round(lineItems.reduce((sum, item) => sum + item.amount, 0) * 100) / 100;
  const cgstAmount = Math.round(((subtotal * cgstRate) / 100) * 100) / 100;
  const sgstAmount = Math.round(((subtotal * sgstRate) / 100) * 100) / 100;
  const total = Math.round((subtotal + cgstAmount + sgstAmount) * 100) / 100;
  const balanceDue = Math.round((total - amountPaid) * 100) / 100;

  // Auto-generate from the counter unless the admin typed an explicit override
  // (e.g. to correct a gap or match an external record) — an override doesn't
  // consume or rewind the counter.
  const invoiceNumber = manualInvoiceNumber || formatTaxInvoiceNumber(await nextTaxInvoiceSequence());
  const now = Date.now();

  const pdfBuffer = await renderTaxInvoicePdf({
    invoiceNumber,
    issuedAt: now,
    terms,
    placeOfSupply,
    billToName,
    billToAddress,
    lineItems,
    subtotal,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    total,
    amountPaid,
    balanceDue,
    notes: notes ?? null,
  });

  const invoiceRef = adminDb.collection("taxInvoices").doc();
  const storagePath = `taxInvoices/${invoiceRef.id}.pdf`;
  await adminStorage.bucket().file(storagePath).save(pdfBuffer, {
    metadata: { contentType: "application/pdf" },
  });

  const invoice: TaxInvoice = {
    id: invoiceRef.id,
    invoiceNumber,
    clientUid: resolvedClientUid,
    billToName,
    billToAddress,
    placeOfSupply,
    lineItems,
    subtotal,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    total,
    amountPaid,
    balanceDue,
    currency: "INR",
    terms,
    notes: notes ?? null,
    pdfStoragePath: storagePath,
    issuedAt: now,
    issuedBy: session.uid,
  };
  await invoiceRef.set(invoice);

  revalidatePath("/admin/billing");
  return { status: "success", invoiceNumber };
}

export type DeleteTaxInvoiceState = { status: "idle" } | { status: "error"; message: string };

export async function deleteTaxInvoice(
  invoiceId: string,
  _prevState: DeleteTaxInvoiceState
): Promise<DeleteTaxInvoiceState> {
  await requireAdmin();

  const invoiceRef = adminDb.collection("taxInvoices").doc(invoiceId);
  const snap = await invoiceRef.get();
  if (!snap.exists) {
    return { status: "error", message: "Invoice not found." };
  }
  const { pdfStoragePath } = snap.data() as TaxInvoice;

  if (pdfStoragePath) {
    await adminStorage.bucket().file(pdfStoragePath).delete().catch(() => null);
  }
  await invoiceRef.delete();

  revalidatePath("/admin/billing");
  return { status: "idle" };
}
