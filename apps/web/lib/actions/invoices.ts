"use server";

import PDFDocument from "pdfkit";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { formatInvoiceNumber } from "@lps/shared";
import type { Order, Invoice, InvoiceLineItem } from "@lps/shared";

export type GenerateInvoiceState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

const BRAND = {
  ink900: "#151517",
  ink700: "#3a3a3f",
  ink500: "#6b6b72",
  ink100: "#e4e4e8",
  accent600: "#a8791f",
};

// Per-year invoice counter, allocated inside a transaction so concurrent admins
// can't collide on the same sequence number. See formatInvoiceNumber for the format.
async function nextInvoiceSequence(year: number): Promise<number> {
  const counterRef = adminDb.collection("counters").doc(`invoices-${year}`);
  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const next = (snap.exists ? (snap.data()!.seq as number) : 0) + 1;
    tx.set(counterRef, { seq: next }, { merge: true });
    return next;
  });
}

// Intl's "currency" style renders "₹", but pdfkit's built-in fonts have no glyph
// for it (renders as garbage) — spell out the currency code instead.
function formatCurrency(amount: number, currency: string): string {
  const number = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    amount
  );
  return `${currency} ${number}`;
}

function renderInvoicePdf(params: {
  invoiceNumber: string;
  issuedAt: number;
  clientName: string;
  clientEmail: string;
  shootType: string;
  shootDate: number;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).fillColor(BRAND.ink900).text("Little Pixel Studios");
    doc.fontSize(10).fillColor(BRAND.ink500).text("Photography Services");
    doc.moveDown(1.5);

    doc.fontSize(14).fillColor(BRAND.ink900).text(`Invoice ${params.invoiceNumber}`);
    doc.fontSize(10).fillColor(BRAND.ink500).text(`Issued: ${new Date(params.issuedAt).toLocaleDateString("en-IN")}`);
    doc.moveDown(1);

    doc.fontSize(11).fillColor(BRAND.ink900).text("Bill to");
    doc.fontSize(10).fillColor(BRAND.ink700).text(params.clientName);
    doc.fillColor(BRAND.ink700).text(params.clientEmail);
    doc.moveDown(1);

    doc
      .fontSize(10)
      .fillColor(BRAND.ink500)
      .text(`${params.shootType} — ${new Date(params.shootDate).toLocaleDateString("en-IN")}`);
    doc.moveDown(1.5);

    const tableLeft = 50;
    const amountColLeft = 400;
    const tableRight = 545;

    let y = doc.y;
    doc.fontSize(10).fillColor(BRAND.ink900);
    doc.text("Description", tableLeft, y, { width: amountColLeft - tableLeft });
    doc.text("Amount", amountColLeft, y, { width: tableRight - amountColLeft, align: "right" });
    y = doc.y + 4;
    doc.moveTo(tableLeft, y).lineTo(tableRight, y).strokeColor(BRAND.ink100).stroke();
    doc.moveDown(1);

    for (const item of params.lineItems) {
      y = doc.y;
      doc.fontSize(10).fillColor(BRAND.ink700);
      doc.text(item.description, tableLeft, y, { width: amountColLeft - tableLeft });
      doc.text(formatCurrency(item.amount, params.currency), amountColLeft, y, {
        width: tableRight - amountColLeft,
        align: "right",
      });
      doc.moveDown(0.6);
    }

    doc.moveDown(0.5);
    y = doc.y;
    doc.moveTo(amountColLeft, y).lineTo(tableRight, y).strokeColor(BRAND.ink100).stroke();
    doc.moveDown(0.5);

    const totalsRow = (label: string, amount: number, opts?: { bold?: boolean }) => {
      const rowY = doc.y;
      doc.fontSize(opts?.bold ? 12 : 10).fillColor(opts?.bold ? BRAND.ink900 : BRAND.ink500);
      doc.text(label, amountColLeft, rowY, { width: 80 });
      doc.text(formatCurrency(amount, params.currency), amountColLeft, rowY, {
        width: tableRight - amountColLeft,
        align: "right",
      });
      doc.moveDown(0.5);
    };
    totalsRow("Subtotal", params.subtotal);
    if (params.tax > 0) totalsRow("Tax", params.tax);
    totalsRow("Total", params.total, { bold: true });

    doc.moveDown(2);
    doc
      .fontSize(9)
      .fillColor(BRAND.accent600)
      .text("Thank you for choosing Little Pixel Studios.", tableLeft, doc.y, {
        width: tableRight - tableLeft,
        align: "center",
      });

    doc.end();
  });
}

export async function generateInvoice(
  orderId: string,
  _prevState: GenerateInvoiceState
): Promise<GenerateInvoiceState> {
  await requireAdmin();

  const orderRef = adminDb.collection("orders").doc(orderId);
  const orderSnap = await orderRef.get();
  if (!orderSnap.exists) {
    return { status: "error", message: "Order not found." };
  }
  const order = orderSnap.data() as Order;

  if (order.status !== "paid") {
    return { status: "error", message: 'Order must be "paid" before an invoice can be generated.' };
  }

  const existing = await adminDb.collection("invoices").where("orderId", "==", orderId).limit(1).get();
  if (!existing.empty) {
    return { status: "error", message: "An invoice already exists for this order." };
  }

  const paidPayment = await adminDb
    .collection("payments")
    .where("orderId", "==", orderId)
    .where("status", "==", "paid")
    .limit(1)
    .get();
  const relatedPaymentId = paidPayment.empty ? null : paidPayment.docs[0]!.id;

  const now = Date.now();
  const year = new Date(now).getFullYear();
  const sequence = await nextInvoiceSequence(year);
  const invoiceNumber = formatInvoiceNumber(year, sequence);

  const lineItems: InvoiceLineItem[] = [
    { description: `${order.shootType} — Photography services`, amount: order.amountDue },
  ];
  const subtotal = order.amountDue;
  const tax = 0;
  const total = subtotal + tax;

  const pdfBuffer = await renderInvoicePdf({
    invoiceNumber,
    issuedAt: now,
    clientName: order.clientName,
    clientEmail: order.clientEmail,
    shootType: order.shootType,
    shootDate: order.shootDate,
    lineItems,
    subtotal,
    tax,
    total,
    currency: order.currency,
  });

  const invoiceRef = adminDb.collection("invoices").doc();
  const storagePath = `orders/${orderId}/invoices/${invoiceRef.id}.pdf`;
  await adminStorage.bucket().file(storagePath).save(pdfBuffer, {
    metadata: { contentType: "application/pdf" },
  });

  const invoice: Invoice = {
    id: invoiceRef.id,
    orderId,
    clientUid: order.clientUid,
    invoiceNumber,
    lineItems,
    subtotal,
    tax,
    total,
    currency: order.currency,
    status: "issued",
    pdfStoragePath: storagePath,
    relatedPaymentId,
    issuedAt: now,
    dueDate: null,
  };
  await invoiceRef.set(invoice);

  await orderRef.update({ status: "invoiced", updatedAt: now });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/portal/orders/${orderId}`);
  return { status: "success" };
}
