import PDFDocument from "pdfkit";
import { BUSINESS_INFO } from "@/lib/invoice/businessInfo";
import { amountToIndianWords } from "./numberToIndianWords";
import type { TaxInvoiceLineItem } from "@lps/shared";

const BRAND = {
  ink900: "#151517",
  ink700: "#3a3a3f",
  ink500: "#6b6b72",
  ink100: "#e4e4e8",
  accent600: "#a8791f",
};

// pdfkit's built-in fonts have no ₹ glyph — spell out the amount instead.
function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

const PAGE_LEFT = 50;
const PAGE_RIGHT = 545;

// Column widths for the item table, summing to PAGE_RIGHT - PAGE_LEFT (495pt).
const COLS = {
  index: 20,
  description: 125,
  hsnSac: 50,
  qty: 30,
  rate: 55,
  cgstPct: 25,
  cgstAmt: 45,
  sgstPct: 25,
  sgstAmt: 45,
  amount: 75,
};

export function renderTaxInvoicePdf(params: {
  invoiceNumber: string;
  issuedAt: number;
  terms: string;
  placeOfSupply: string;
  billToName: string;
  billToAddress: string | null;
  lineItems: TaxInvoiceLineItem[];
  subtotal: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  notes: string | null;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const issuedDate = new Date(params.issuedAt).toLocaleDateString("en-GB");

    // Header: business info (left) + invoice meta (right), same top y.
    const headerTop = doc.y;
    doc.fontSize(18).fillColor(BRAND.ink900).text(BUSINESS_INFO.name, PAGE_LEFT, headerTop, { width: 280 });
    doc.fontSize(9).fillColor(BRAND.ink500);
    for (const line of BUSINESS_INFO.addressLines) doc.text(line, { width: 280 });
    doc.text(`GSTIN ${BUSINESS_INFO.gstin}`, { width: 280 });
    doc.text(BUSINESS_INFO.email, { width: 280 });

    const metaWidth = 200;
    const metaLeft = PAGE_RIGHT - metaWidth;
    doc.fontSize(16).fillColor(BRAND.ink900).text("TAX INVOICE", metaLeft, headerTop, { width: metaWidth, align: "right" });
    doc.fontSize(9).fillColor(BRAND.ink500);
    doc.text(`# : ${params.invoiceNumber}`, metaLeft, doc.y, { width: metaWidth, align: "right" });
    doc.text(`Invoice Date : ${issuedDate}`, metaLeft, doc.y, { width: metaWidth, align: "right" });
    doc.text(`Terms : ${params.terms}`, metaLeft, doc.y, { width: metaWidth, align: "right" });
    doc.text(`Due Date : ${issuedDate}`, metaLeft, doc.y, { width: metaWidth, align: "right" });
    doc.text(`Place Of Supply : ${params.placeOfSupply}`, metaLeft, doc.y, { width: metaWidth, align: "right" });

    doc.y = Math.max(doc.y, headerTop + 100);
    doc.moveDown(1);
    doc.moveTo(PAGE_LEFT, doc.y).lineTo(PAGE_RIGHT, doc.y).strokeColor(BRAND.ink100).stroke();
    doc.moveDown(1);

    doc.fontSize(10).fillColor(BRAND.ink900).text("Bill To", PAGE_LEFT, doc.y);
    doc.fontSize(11).fillColor(BRAND.ink700).text(params.billToName);
    if (params.billToAddress) {
      doc.fontSize(9).fillColor(BRAND.ink500).text(params.billToAddress);
    }
    doc.moveDown(1.5);

    // Item table header.
    let x = PAGE_LEFT;
    const y = doc.y;
    const headerCell = (label: string, width: number, align: "left" | "right" | "center" = "left") => {
      doc.fontSize(8).fillColor(BRAND.ink900).text(label, x, y, { width, align });
      x += width;
    };
    headerCell("#", COLS.index);
    headerCell("Item & Description", COLS.description);
    headerCell("HSN/SAC", COLS.hsnSac, "center");
    headerCell("Qty", COLS.qty, "center");
    headerCell("Rate", COLS.rate, "right");
    headerCell("CGST %", COLS.cgstPct, "center");
    headerCell("CGST Amt", COLS.cgstAmt, "right");
    headerCell("SGST %", COLS.sgstPct, "center");
    headerCell("SGST Amt", COLS.sgstAmt, "right");
    headerCell("Amount", COLS.amount, "right");
    doc.y = y + 14;
    doc.moveTo(PAGE_LEFT, doc.y).lineTo(PAGE_RIGHT, doc.y).strokeColor(BRAND.ink100).stroke();
    doc.moveDown(0.5);

    params.lineItems.forEach((item, i) => {
      const cgstAmt = (item.amount * params.cgstRate) / 100;
      const sgstAmt = (item.amount * params.sgstRate) / 100;
      const rowY = doc.y;
      x = PAGE_LEFT;
      const cell = (text: string, width: number, align: "left" | "right" | "center" = "left") => {
        doc.fontSize(9).fillColor(BRAND.ink700).text(text, x, rowY, { width, align });
        x += width;
      };
      cell(String(i + 1), COLS.index);
      cell(item.description, COLS.description);
      cell(item.hsnSac, COLS.hsnSac, "center");
      cell(item.qty.toFixed(2), COLS.qty, "center");
      cell(formatAmount(item.rate), COLS.rate, "right");
      cell(`${params.cgstRate}%`, COLS.cgstPct, "center");
      cell(formatAmount(cgstAmt), COLS.cgstAmt, "right");
      cell(`${params.sgstRate}%`, COLS.sgstPct, "center");
      cell(formatAmount(sgstAmt), COLS.sgstAmt, "right");
      cell(formatAmount(item.amount), COLS.amount, "right");
      doc.y = rowY + Math.max(14, doc.heightOfString(item.description, { width: COLS.description }));
      doc.moveDown(0.4);
    });

    doc.moveDown(0.3);
    doc.moveTo(PAGE_LEFT, doc.y).lineTo(PAGE_RIGHT, doc.y).strokeColor(BRAND.ink100).stroke();
    doc.moveDown(0.5);

    const totalsLabelWidth = 120;
    const totalsLeft = PAGE_RIGHT - totalsLabelWidth - COLS.amount;
    const totalsRow = (label: string, amount: number, opts?: { bold?: boolean }) => {
      const rowY = doc.y;
      doc.fontSize(opts?.bold ? 12 : 9).fillColor(opts?.bold ? BRAND.ink900 : BRAND.ink500);
      doc.text(label, totalsLeft, rowY, { width: totalsLabelWidth });
      doc.text(formatAmount(amount), totalsLeft + totalsLabelWidth, rowY, { width: COLS.amount, align: "right" });
      doc.moveDown(0.5);
    };
    totalsRow("Sub Total", params.subtotal);
    if (params.cgstAmount > 0) totalsRow(`CGST (${params.cgstRate}%)`, params.cgstAmount);
    if (params.sgstAmount > 0) totalsRow(`SGST (${params.sgstRate}%)`, params.sgstAmount);
    totalsRow("Total", params.total, { bold: true });
    totalsRow("Payment Made", params.amountPaid);
    totalsRow("Balance Due", params.balanceDue, { bold: true });

    doc.moveDown(1.5);
    doc.fontSize(10).fillColor(BRAND.ink900).text("Total In Words", PAGE_LEFT, doc.y);
    doc.fontSize(9).fillColor(BRAND.ink700).text(amountToIndianWords(params.total));
    doc.moveDown(1.5);

    const footerTop = doc.y;
    if (params.notes) {
      doc.fontSize(10).fillColor(BRAND.ink900).text("Notes", PAGE_LEFT, footerTop, { width: 300 });
      doc.fontSize(9).fillColor(BRAND.ink500).text(params.notes, PAGE_LEFT, doc.y, { width: 300 });
    }
    const notesBottom = doc.y;

    doc.fontSize(9).fillColor(BRAND.ink500).text("Authorized Signature", PAGE_LEFT, footerTop, {
      width: PAGE_RIGHT - PAGE_LEFT,
      align: "right",
    });
    doc
      .fontSize(9)
      .fillColor(BRAND.ink700)
      .text("_________________________", PAGE_LEFT, footerTop + 45, { width: PAGE_RIGHT - PAGE_LEFT, align: "right" });
    doc.text(BUSINESS_INFO.name, PAGE_LEFT, doc.y, { width: PAGE_RIGHT - PAGE_LEFT, align: "right" });

    doc.y = Math.max(notesBottom, doc.y);

    doc.moveDown(2);
    doc
      .fontSize(9)
      .fillColor(BRAND.accent600)
      .text("Thank you for your business.", PAGE_LEFT, doc.y, { width: PAGE_RIGHT - PAGE_LEFT, align: "center" });

    doc.end();
  });
}
