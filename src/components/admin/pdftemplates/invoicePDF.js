// src/components/admin/pdfTemplates/invoicePDF.js
//
// Invoice-family PDFs (teal theme):
//   printInvoice        — drop-in replacement for invoiceGenerator.printInvoice
//   buildInvoiceBlobUrl — drop-in replacement for invoiceGenerator.buildInvoiceBlobUrl
//   printSalesInvoice   — Sales.jsx invoice print + blob persistence
//   printPurchaseOrder  — Purchase.jsx PO print + blob persistence
//
// All caller import paths stay the same — they import from ../PDFTemplates which
// re-exports everything from here.

import {
  CO, BASE_CSS,
  fmtDate, fmtINR, esc, numberToWords,
  invoiceCoHeader,
  openPrintWindow, apiGet, savePdfBlob, linkPdfToRecord,
} from "./pdfShared";

// ── Teal invoice / purchase theme ────────────────────────────
const INVOICE_CSS = `${BASE_CSS}
  .page { max-width:820px; margin:0 auto; }

  /* Header */
  .hdr { display:flex; align-items:flex-start; gap:14px;
         border-bottom:2.5px solid #0f766e; padding-bottom:14px; margin-bottom:0; }
  .hdr-center { flex:1; }
  .hdr-right  { text-align:right; font-size:10px; color:#444; line-height:1.75;
                flex-shrink:0; margin-left:12px; margin-right:80px; }
  .hdr-right .stamp { font-size:13px; font-weight:900; color:#0f766e;
                      margin-bottom:2px; white-space:nowrap; }
  .co-name { font-size:22px; font-weight:900; color:#0f766e;
             line-height:1.1; margin-bottom:4px; }
  .co-meta  { font-size:9.5px; color:#444; line-height:1.75; }

  /* Print button (screen only) */
  .print-btn { display:inline-block; margin-bottom:14px; padding:8px 20px;
               background:#0f766e; color:#fff; border:none; border-radius:6px;
               font-size:12px; font-weight:700; cursor:pointer; }
  .print-btn:hover { background:#0d5f58; }

  /* Doc title */
  .doc-title { text-align:center; font-size:15px; font-weight:bold;
               letter-spacing:1px; margin:10px 0 0;
               text-decoration:underline; text-underline-offset:3px; color:#0f766e; }

  /* Party info grid */
  .grid2 { display:grid; grid-template-columns:1fr 1fr; }
  .cell  { padding:7px 10px; border:1px solid #ccc; border-top:none; border-right:none;
           font-size:10.5px; line-height:1.7;
           page-break-inside:avoid; break-inside:avoid; }
  .cell:last-child { border-right:1px solid #ccc; }
  .cell-label { font-weight:800; font-size:9px; text-transform:uppercase;
                color:#555; letter-spacing:0.04em; margin-bottom:3px; }
  .kv { display:flex; gap:4px; }
  .kk { font-weight:700; min-width:90px; }

  /* Items table */
  .tbl-wrap { border:1px solid #ccc; border-top:none; overflow:hidden; }
  table.items { width:100%; border-collapse:collapse; }
  table.items th { background:#0f766e; color:#fff; padding:6px 7px;
                   font-size:9px; font-weight:700; text-transform:uppercase;
                   letter-spacing:0.02em; border:1px solid #0a5e58; }
  table.items td { padding:5px 7px; border:1px solid #ddd;
                   font-size:10.5px; vertical-align:middle; }
  table.items tbody tr { page-break-inside:avoid; break-inside:avoid; }
  table.items tr:nth-child(even) td { background:#f4fffe; }

  /* Totals */
  .totals-wrap { display:grid; grid-template-columns:1fr auto;
                 border:1px solid #ccc; border-top:none;
                 page-break-inside:avoid; break-inside:avoid; }
  .words { padding:10px; border-right:1px solid #ccc; }
  .amts  { padding:8px 14px; min-width:260px; }
  .aline { display:flex; justify-content:space-between; gap:24px;
           padding:2px 0; font-size:10.5px; }
  .aline.bold { font-weight:800; font-size:11.5px; border-top:1px solid #ccc;
                padding-top:5px; margin-top:4px; color:#0f766e; }
  .aline.rnd  { font-weight:900; font-size:13px; color:#0f766e;
                border-top:2px solid #0f766e; padding-top:4px; margin-top:2px; }

  /* Terms */
  .terms { border:1px solid #ccc; border-top:none; padding:9px 10px;
           font-size:10.5px; line-height:1.85;
           page-break-inside:avoid; break-inside:avoid; }

  /* Signature row */
  .sig-row { display:flex; justify-content:space-between; align-items:flex-end;
             margin-top:32px; padding:0 10px;
             page-break-inside:avoid; break-inside:avoid; }
  .sig-right { text-align:center; }
  .sig-right::before { content:""; display:block; width:160px;
                       border-top:1px solid #333; margin:0 auto 5px; }
  .sig-label { font-size:10px; font-weight:700; text-transform:uppercase; }

  /* Pagination */
  .page-break { page-break-before:always; break-before:always; }
`;

// ── Party block (buyer / seller metadata) ─────────────────────
function buildPartyBlock(toParty, fromPartyName, meta) {
  const { refNo, dateStr, currency, paymentTerms, deliveryTerms, validity, contactName } = meta;
  const pName = esc(toParty.companyName || toParty.name || "—");
  const pGst  = esc(toParty.gstNo  || toParty.gst  || "—");
  const pCin  = esc(toParty.cinNo  || toParty.cin  || "—");
  const pPan  = esc(toParty.panNo  || toParty.pan  || "—");
  const bAddr = [toParty.buyerAddress1||"", toParty.buyerAddress2||"", toParty.buyerAddress3||""]
                  .filter(Boolean).map(esc).join("<br/>") || "—";
  const sAddr = [toParty.shippingAddress1||"", toParty.shippingAddress2||"", toParty.shippingAddress3||""]
                  .filter(Boolean).map(esc).join("<br/>") || "—";

  return `
  <div class="grid2" style="border-top:1px solid #ccc">
    <div class="cell">
      <div class="kv"><span class="kk">TO PARTY</span><span>: ${pName}</span></div>
      <div class="kv"><span class="kk">GST NO</span><span>: ${pGst}</span></div>
      <div class="kv"><span class="kk">CIN NO</span><span>: ${pCin}</span></div>
      <div class="kv"><span class="kk">PAN No</span><span>: ${pPan}</span></div>
    </div>
    <div class="cell" >
      <div class="kv"><span class="kk">REF NO</span><span>: ${esc(refNo)}</span></div>
      <div class="kv"><span class="kk">DATE</span><span>: ${esc(dateStr)}</span></div>
      <div class="kv"><span class="kk">VALIDITY</span><span>: ${fmtDate(validity)}</span></div>
      <div class="kv"><span class="kk">CURRENCY</span><span>: ${esc(currency||"INR")}</span></div>
    </div>
  </div>
  <div class="grid2">
    <div class="cell">
      <div class="cell-label">Billing Address</div>
      <div style="margin-top:4px">${bAddr}</div>
    </div>
    <div class="cell">
      <div class="cell-label">Shipping Address</div>
      <div style="margin-top:4px">${sAddr}</div>
      ${contactName ? `<div style="margin-top:8px"><span style="font-weight:700">Kind Attention</span>: ${esc(contactName)}</div>` : ""}
    </div>
  </div>
  <div class="grid2">
    <div class="cell">
      <div class="kv"><span class="kk">FROM</span><span>: ${esc(fromPartyName)}</span></div>
    </div>
    <div class="cell">
      <div class="kv"><span class="kk">PAYMENT</span><span>: ${esc(paymentTerms||"—")}</span></div>
      <div class="kv"><span class="kk">DELIVERY</span><span>: ${esc(deliveryTerms||"—")}</span></div>
    </div>
  </div>`;
}

// ── Line item row ─────────────────────────────────────────────
function invoiceTableHeader() {
  return `<table class="items">
    <thead><tr>
      <th style="width:30px">S.NO</th>
      <th style="text-align:left">NAME / DESCRIPTION</th>
      <th style="width:62px">HSN/SAC</th>
      <th style="width:42px">QTY</th>
      <th style="width:38px">UNIT</th>
      <th style="width:62px;text-align:right">RATE</th>
      <th style="width:66px;text-align:right">TAXABLE</th>
      <th style="width:44px">CGST%</th>
      <th style="width:56px;text-align:right">CGST</th>
      <th style="width:44px">SGST%</th>
      <th style="width:56px;text-align:right">SGST</th>
      <th style="width:44px">IGST%</th>
      <th style="width:56px;text-align:right">IGST</th>
      <th style="width:64px;text-align:right">TOTAL</th>
    </tr></thead>
    <tbody>`;
}

function buildItemRow(li, rowNum) {
  return `<tr>
    <td style="text-align:center">${rowNum}</td>
    <td><b>${esc(li.product || li.nameOfProductService || "")}</b></td>
    <td style="text-align:center">${esc(li.hsnCode || li.hsnAcs || "")}</td>
    <td style="text-align:center">${Number(li.quantity)||0}</td>
    <td style="text-align:center">${esc(li.unit||"")}</td>
    <td style="text-align:right">${fmtINR(li.unitRate)}</td>
    <td style="text-align:right">${fmtINR(li.taxableValue)}</td>
    <td style="text-align:center">${li.cgstRate||0}%</td>
    <td style="text-align:right">${fmtINR(li.cgstAmount)}</td>
    <td style="text-align:center">${li.sgstRate||0}%</td>
    <td style="text-align:right">${fmtINR(li.sgstAmount)}</td>
    <td style="text-align:center">${li.igstRate||0}%</td>
    <td style="text-align:right">${fmtINR(li.igstAmount)}</td>
    <td style="text-align:right;font-weight:700">${fmtINR(li.total)}</td>
  </tr>`;
}

// ── Totals block (words + amount grid) ───────────────────────
function buildTotalsBlock(items, currency) {
  const grandTaxable = items.reduce((a, l) => a + (Number(l.taxableValue) || 0), 0);
  const grandCgst    = items.reduce((a, l) => a + (Number(l.cgstAmount)   || 0), 0);
  const grandSgst    = items.reduce((a, l) => a + (Number(l.sgstAmount)   || 0), 0);
  const grandIgst    = items.reduce((a, l) => a + (Number(l.igstAmount)   || 0), 0);
  const grandTotal   = items.reduce((a, l) => a + (Number(l.total)        || 0), 0);
  const roundOff     = Math.round(grandTotal);
  return `<div class="totals-wrap">
    <div class="words">
      <div style="font-weight:800;font-size:9px;text-transform:uppercase;
                  letter-spacing:0.04em;margin-bottom:6px;color:#555">Total Amount in Words</div>
      <div style="font-size:11px;font-style:italic;color:#0f766e;
                  font-weight:600;text-transform:capitalize">
        ${numberToWords(roundOff)}
      </div>
    </div>
    <div class="amts">
      <div class="aline"><span>TOTAL TAXABLE</span><span>${fmtINR(grandTaxable)}</span></div>
      <div class="aline"><span>TOTAL CGST</span><span>${fmtINR(grandCgst)}</span></div>
      <div class="aline"><span>TOTAL SGST</span><span>${fmtINR(grandSgst)}</span></div>
      <div class="aline"><span>TOTAL IGST</span><span>${fmtINR(grandIgst)}</span></div>
      <div class="aline bold">
        <span>TOTAL (${esc(currency||"INR")})</span><span>${fmtINR(grandTotal)}</span>
      </div>
      <div class="aline rnd"><span>ROUND OFF</span><span>${roundOff}</span></div>
    </div>
  </div>`;
}

// ── Paginated items section (max 10 rows per print page) ──────
const ITEMS_PER_PAGE = 10;

function buildPagedItems(items, currency, descHtml = "") {
  if (!items || items.length === 0) {
    return `${descHtml}
      <div class="tbl-wrap">${invoiceTableHeader()}
        <tr><td colspan="14" style="text-align:center;padding:16px;color:#888;
            font-style:italic">No line items</td></tr>
      </tbody></table></div>
      ${buildTotalsBlock([], currency)}`;
  }

  const chunks = [];
  for (let i = 0; i < items.length; i += ITEMS_PER_PAGE)
    chunks.push(items.slice(i, i + ITEMS_PER_PAGE));

  let html = descHtml;
  chunks.forEach((chunk, pageIdx) => {
    const offset = pageIdx * ITEMS_PER_PAGE;
    const isLast = pageIdx === chunks.length - 1;
    if (pageIdx > 0) html += `<div class="page-break"></div>`;
    html += `<div class="tbl-wrap">${invoiceTableHeader()}`;
    chunk.forEach((li, i) => { html += buildItemRow(li, offset + i + 1); });
    html += `</tbody></table></div>`;
    if (isLast) {
      html += buildTotalsBlock(items, currency);
    } else {
      const shown = offset + chunk.length;
      html += `<p style="font-size:10px;color:#888;text-align:right;margin-top:4px">
        Continued on next page… (${shown} of ${items.length} items shown)</p>`;
    }
  });
  return html;
}

// ── Core HTML builder (shared by printInvoice, printSalesInvoice, printPurchaseOrder) ──
function buildInvoiceHTML({
  docType, refNo, date, validity, currency,
  toParty, fromPartyName, contactName,
  paymentTerms, deliveryTerms, description, items,
}) {
  const dateStr  = fmtDate(date);
  const descHtml = description
    ? `<div class="terms" style="border-top:1px solid #ccc">
         <b>Description:</b> ${esc(description)}</div>`
    : "";
  const termsLines = [
    paymentTerms  ? `Payment Terms: ${esc(paymentTerms)}`   : "",
    deliveryTerms ? `Delivery Terms: ${esc(deliveryTerms)}` : "",
  ].filter(Boolean).join("<br/>");

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>${esc(docType)} — ${esc(refNo)}</title>
<style>${INVOICE_CSS}</style>
</head><body>
<div class="page">
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
  ${invoiceCoHeader()}
  <div class="doc-title">${esc(docType).toUpperCase()}</div>
  ${buildPartyBlock(toParty || {}, fromPartyName || CO.name, {
    refNo, dateStr, currency, paymentTerms, deliveryTerms, validity, contactName,
  })}
  ${descHtml}
  ${buildPagedItems(items || [], currency)}
  ${termsLines
    ? `<div class="terms"><b>Terms &amp; Conditions:</b><br/>${termsLines}</div>`
    : ""}
  <div class="sig-row">
    <div style="font-size:11px;font-weight:700">FOR ${esc(CO.name.toUpperCase())}</div>
    <div class="sig-right">
      <div class="sig-label">Authorised Signature</div>
    </div>
  </div>
</div>
</body></html>`;
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

// ── 1 · Drop-in replacements for invoiceGenerator.js (ActivityLog.jsx) ──

/** Same signature as the old invoiceGenerator.printInvoice */
export function printInvoice(doc) {
  openPrintWindow(buildInvoiceHTML({
    docType:       doc.docType       || "Invoice",
    refNo:         doc.refNo         || "",
    date:          doc.date          || "",
    validity:      doc.validity      || "",
    currency:      doc.currency      || "INR",
    toParty:       doc.toParty       || {},
    fromPartyName: CO.name,
    contactName:   doc.contactName   || "",
    paymentTerms:  doc.paymentTerms  || "",
    deliveryTerms: doc.deliveryTerms || "",
    description:   doc.description   || "",
    items:         doc.items         || [],
  }));
}

/** Same signature as the old invoiceGenerator.buildInvoiceBlobUrl */
export function buildInvoiceBlobUrl(doc) {
  const html = buildInvoiceHTML({
    docType:       doc.docType       || "Invoice",
    refNo:         doc.refNo         || "",
    date:          doc.date          || "",
    validity:      doc.validity      || "",
    currency:      doc.currency      || "INR",
    toParty:       doc.toParty       || {},
    fromPartyName: CO.name,
    contactName:   doc.contactName   || "",
    paymentTerms:  doc.paymentTerms  || "",
    deliveryTerms: doc.deliveryTerms || "",
    description:   doc.description   || "",
    items:         doc.items         || [],
  });
  return URL.createObjectURL(new Blob([html], { type: "text/html" }));
}

// ── 2 · Sales Invoice (Sales.jsx) ────────────────────────────
export async function printSalesInvoice({ sale, items, customers }) {
  const [resolvedItems, resolvedCustomers] = await Promise.all([
    items     ? Promise.resolve(items)     : apiGet(`/api/sales-items/by-sales/${sale.id}`).catch(() => []),
    customers ? Promise.resolve(customers) : apiGet("/api/customers").catch(() => []),
  ]);

  const toParty   = resolvedCustomers.find(c => String(c.id) === String(sale.toParty))   || {};
  const fromParty = resolvedCustomers.find(c => String(c.id) === String(sale.fromParty)) || {};

  let contactName = sale.addressedTo || "—";
  if (sale.addressedTo && sale.toParty) {
    try {
      const list  = await apiGet(`/api/customers/${sale.toParty}/parties`);
      const found = (Array.isArray(list) ? list : [])
        .find(c => String(c.id) === String(sale.addressedTo));
      if (found) contactName = found.partyName || found.name || contactName;
    } catch { /* keep raw value */ }
  }

  const refNo         = `S-${String(sale.id).padStart(3, "0")}`;
  const dateStr       = fmtDate(sale.date);
  const docType       = sale.documentType || "Sales Invoice";
  const fromPartyName = fromParty.companyName || fromParty.name || CO.name;

  const html = buildInvoiceHTML({
    docType, refNo, date: sale.date, validity: sale.validity,
    currency: sale.currency, toParty, fromPartyName, contactName,
    paymentTerms: sale.paymentTerms, deliveryTerms: sale.deliveryTerms,
    description: sale.description, items: resolvedItems,
  });

  openPrintWindow(html);
  savePdfBlob(html, `sales-${refNo}-${dateStr}.html`)
    .then(blobId => linkPdfToRecord("sales", sale.id, blobId))
    .catch(() => {});
}

// ── 3 · Purchase Order (Purchase.jsx) ────────────────────────
const PURCHASE_DOCTYPE_LABELS = {
  "1": "Enquiry", "2": "Quotation", "3": "Purchase Order",
  "4": "Invoice", "5": "Delivery Note",
};

export async function printPurchaseOrder({ purchase, items, customers }) {
  const fileRef = purchase.purchaseFileRef ?? purchase.id;
  const [resolvedItems, resolvedCustomers] = await Promise.all([
    items     ? Promise.resolve(items)     : apiGet(`/api/purchase-items/by-ref/${fileRef}`).catch(() => []),
    customers ? Promise.resolve(customers) : apiGet("/api/customers").catch(() => []),
  ]);

  const toParty   = resolvedCustomers.find(c => String(c.id) === String(purchase.purchaseToParty))   || {};
  const fromParty = resolvedCustomers.find(c => String(c.id) === String(purchase.purchaseFromParty)) || {};

  let contactName = purchase.purchaseAddressedTo || "—";
  if (purchase.purchaseAddressedTo && purchase.purchaseToParty) {
    try {
      const list  = await apiGet(`/api/customers/${purchase.purchaseToParty}/parties`);
      const found = (Array.isArray(list) ? list : [])
        .find(c => String(c.id) === String(purchase.purchaseAddressedTo));
      if (found) contactName = found.partyName || found.name || contactName;
    } catch { /* keep raw value */ }
  }

  const refNo         = `P-${String(purchase.id).padStart(3, "0")}`;
  const dateStr       = fmtDate(purchase.purchaseDate);
  const docType       = PURCHASE_DOCTYPE_LABELS[String(purchase.purchaseDoctype)] || `Type ${purchase.purchaseDoctype}`;
  const fromPartyName = fromParty.companyName || fromParty.name || CO.name;

  const html = buildInvoiceHTML({
    docType, refNo, date: purchase.purchaseDate, validity: purchase.purchaseValidity,
    currency: purchase.purchaseCurrency, toParty, fromPartyName, contactName,
    paymentTerms: purchase.purchasePaymentTerms, deliveryTerms: purchase.purchaseDeliveryTerms,
    description: purchase.purchaseDescription, items: resolvedItems,
  });

  openPrintWindow(html);
  savePdfBlob(html, `purchase-${refNo}-${dateStr}.html`)
    .then(blobId => linkPdfToRecord("purchases", purchase.id, blobId))
    .catch(() => {});
}
