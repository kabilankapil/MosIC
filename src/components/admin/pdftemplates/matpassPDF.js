// src/components/admin/pdfTemplates/matpassPDF.js
//
// Material Pass PDFs:
//   printMatpassPDF    — open print popup
//   buildMatpassBlobUrl — return blob: URL for inline iframe viewer

import { CO, BASE_CSS, logoImgTag, esc, openPrintWindow, apiGet } from "./pdfShared";

// ── Material Pass theme ───────────────────────────────────────
const MATPASS_CSS = `${BASE_CSS}
  body { padding:20px 28px; }
  .hdr { display:flex; justify-content:space-between; align-items:flex-start;
         border-bottom:2.5px solid #0f766e; padding-bottom:14px; margin-bottom:14px; }
  .hdr-left { display:flex; align-items:flex-start; gap:14px; }
  .hdr-right { text-align:right; font-size:10.5px; color:#444;
               line-height:1.7; flex-shrink:0; margin-left:12px; }
  .hdr-right .stamp { font-size:13px; font-weight:800; color:#0f766e; margin-bottom:2px; }
  .co-name { font-size:22px; font-weight:900; color:#0f766e;
             letter-spacing:-0.5px; line-height:1.1; margin-bottom:4px; }
  .co-meta { font-size:10.5px; line-height:1.7; color:#222; }
  .doc-title { text-align:center; font-size:16px; font-weight:bold;
               letter-spacing:1px; margin:8px 0 14px;
               text-decoration:underline; text-underline-offset:3px; color:#0f766e; }
  .info-table { width:100%; border-collapse:collapse; margin-bottom:10px;
                page-break-inside:avoid; break-inside:avoid; }
  .info-table td { border:1px solid #bbb; padding:7px 10px; vertical-align:top; }
  .subject-row { display:flex; justify-content:space-between; border:1px solid #bbb;
                 padding:6px 10px; margin-bottom:10px; font-weight:700; font-size:12px;
                 page-break-inside:avoid; break-inside:avoid;
                 background:#f4fffe; color:#0f766e; }
  .body-text { margin-bottom:10px; font-size:11.5px; line-height:1.6; }
  .items-table { width:100%; border-collapse:collapse; margin-bottom:20px; }
  .items-table th { border:1px solid #0a5e58; padding:7px 10px; background:#0f766e;
                    color:#fff; font-weight:700; text-align:center;
                    font-size:11px; text-transform:uppercase; letter-spacing:0.04em; }
  .items-table td { border:1px solid #ccc; padding:7px 10px; font-size:11.5px; }
  .items-table tbody tr { page-break-inside:avoid; break-inside:avoid; }
  .items-table tr:nth-child(even) td { background:#f4fffe; }
  .ack-box { border:1px solid #bbb; padding:14px 16px; margin-top:16px;
             page-break-inside:avoid; break-inside:avoid; }
  .ack-title { font-weight:bold; text-align:center; font-size:13px;
               margin-bottom:8px; letter-spacing:0.05em; color:#0f766e; }
  .ack-text  { font-size:11.5px; line-height:1.6; margin-bottom:28px; }
  .sign-row  { display:flex; justify-content:space-between;
               font-weight:700; font-size:12px; margin-top:8px; }
`;

// ── Internal HTML builder ─────────────────────────────────────
// Shared by printMatpassPDF (popup) and buildMatpassBlobUrl (iframe blob).
// If the caller already has customers/stockItems in state they're passed in
// directly — no redundant API calls.
async function _buildMatpassHTML({ row, customers, stockItems, toast, movements: passedMovements }) {
  const [resolvedCustomers, resolvedStockItems] = await Promise.all([
    customers  ? Promise.resolve(customers)  : apiGet("/api/customers").catch(() => []),
    stockItems ? Promise.resolve(stockItems) : apiGet("/api/stock-items").catch(() => []),
  ]);

  const customer = resolvedCustomers.find(c => String(c.id) === String(row.party));

  let contactName  = row.contactPerson || "—";
  let contactPhone = "";
  if (row.contactPerson && row.party) {
    try {
      const list  = await apiGet(`/api/customers/${row.party}/parties`);
      const found = (Array.isArray(list) ? list : [])
        .find(c => String(c.id) === String(row.contactPerson));
      if (found) {
        contactName  = found.partyName || found.name || contactName;
        contactPhone =  found.partyPhoneno || "";
      }
    } catch { /* keep raw value */ }
  }

  let movements;
  if (passedMovements) {
    // Caller already has the movements in React Query state — no extra fetch.
    movements = passedMovements;
  } else {
    try {
      const data = await apiGet(`/api/stocks/matpass/${row.id}`);
      movements  = Array.isArray(data) ? data.filter(m => Number(m.status) !== 0) : [];
    } catch (e) {
      toast?.error?.("Could not load stock items for PDF: " + e.message);
      return null;
    }
  }

  const itemMap = {};
  (Array.isArray(resolvedStockItems) ? resolvedStockItems : [])
    .forEach(si => { itemMap[si.id] = si; });

  const direction  = (row.inOrOut || "OUT").toUpperCase();
  const dateStr    = row.date || "—";
  const returnType = movements.length > 0
    ? (movements[0].stockReturnOrNonReturn || "NON_RETURN").replace(/-/g, "_").toUpperCase()
    : "NON_RETURN";
  const partyName  = customer?.companyName || customer?.name
    || (row.party ? `Party #${row.party}` : "—");
  const addr1 = customer?.buyerAddress1 || "";
  const addr2 = customer?.buyerAddress2 || "";
  const addr3 = customer?.buyerAddress3 || "";
  const hasTopQty = row.quantity && Number(row.quantity) > 0 && movements.length === 0;

  const rowsHtml = movements.length === 0 && !hasTopQty
    ? `<tr><td colspan="5" style="text-align:center;padding:16px;color:#888;font-style:italic">
         No stock items linked to this MAT Pass.</td></tr>`
    : hasTopQty
    ? `<tr>
         <td style="text-align:center">1</td>
         <td>${esc(row.discription || "General")}</td>
         <td style="text-align:center">—</td>
         <td style="text-align:center">${row.quantity}</td>
         <td>—</td>
       </tr>`
    : movements.map((m, i) => {
        const item = itemMap[m.stockItemId] || {};
        return `<tr>
          <td style="text-align:center">${i + 1}</td>
          <td>${esc(item.productName || `Item #${m.stockItemId}`)}</td>
          <td style="text-align:center">${esc(item.smUnit || "—")}</td>
          <td style="text-align:center">${m.stockQuantity ?? "—"}</td>
          <td>${esc(m.stockDescription || "—")}</td>
        </tr>`;
      }).join("\n");

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>Material Pass</title>
<style>${MATPASS_CSS}</style>
</head><body>
  <div class="hdr">
    <div class="hdr-left">
      ${logoImgTag(72)}
      <div>
        <div class="co-name">${CO.name}</div>
        <div class="co-meta">
          ${CO.addr1} ${CO.addr2}
          <table style="width:100%;border:none;border-collapse:collapse;margin-top:3px">
            <tr><td>GST No: ${CO.gst}</td><td style="padding-left:40px;text-align:right">PAN No: ${CO.pan}</td></tr>
            <tr><td>CIN No: ${CO.cin}</td><td style="padding-left:40px;text-align:right">Website: ${CO.website}</td></tr>
            <tr><td>Phone: ${CO.phone}</td><td style="padding-left:40px;text-align:right">Email: ${CO.email}</td></tr>
          </table>
        </div>
      </div>
    </div>
  </div>
  <div class="doc-title">Material Pass</div>
  <table class="info-table">
    <tr>
      <td style="width:55%;vertical-align:top">
        <strong>TO</strong><br/>
        <strong style="font-size:13px">${esc(partyName)}</strong><br/><br/>
        <strong>ADDRESS DETAILS</strong><br/>
        ${addr1 ? `&nbsp;${esc(addr1)}<br/>` : ""}
        ${addr2 ? `&nbsp;${esc(addr2)}<br/>` : ""}
        ${addr3 ? `&nbsp;${esc(addr3)}<br/>` : ""}
        <br/><strong>Kind Attention:</strong>&nbsp;${esc(contactName)}${contactPhone ? ` / ${esc(contactPhone)}` : ""}
        ${row.quantity ? `<br/><br/><strong>Quantity:</strong>&nbsp;${row.quantity}` : ""}
      </td>
      <td style="vertical-align:top; padding-left:40px">
        <div style="font-size:11px; line-height:2.2;">
          <div><strong>Supply Order:</strong>&nbsp; ${dateStr}</div>
          <div><strong>Date of Supply Order:</strong>&nbsp; ${dateStr}</div>
          <div><strong>Date of Delivery:</strong>&nbsp; ${dateStr}</div>
          <div><strong>Date of Outward:</strong>&nbsp; ${dateStr}</div>
        </div>
      </td>
    </tr>
  </table>
  <div class="subject-row">
    <span>SUB: MATERIAL ${direction} PASS</span>
    <span>${returnType}</span>
  </div>
  <div class="body-text">
    <strong>Dear Sir/Madam</strong><br/>
    ${direction === "OUT"
      ? "We are delivering the following to your stores. Kindly please acknowledge the receipt."
      : "We are receiving the following items from your stores. Kindly please acknowledge the delivery."}
  </div>
  <table class="items-table">
    <thead><tr>
      <th style="width:50px">S.NO</th>
      <th>DESCRIPTION</th>
      <th style="width:80px">UNIT</th>
      <th style="width:90px">QUANTITY</th>
      <th>REMARKS</th>
    </tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <div style="border:1px solid #bbb; height:80px; margin-bottom:16px;
              page-break-inside:avoid; break-inside:avoid;"></div>
  <div class="ack-box">
    <div class="ack-title">ACKNOWLEDGEMENT</div>
    <div class="ack-text">We acknowledge and confirm that we have inspected and received the
    items with details as mentioned above.</div>
    <div class="sign-row">
      <span>Signature of receiver</span>
      <span>Date</span>
    </div>
  </div>
</body></html>`;
}

// ── Exports ───────────────────────────────────────────────────

export async function printMatpassPDF({ row, customers, stockItems, toast }) {
  const html = await _buildMatpassHTML({ row, customers, stockItems, toast });
  if (html) openPrintWindow(html);
}

export async function buildMatpassBlobUrl({ row, customers, stockItems, toast }) {
  const html = await _buildMatpassHTML({ row, customers, stockItems, toast });
  if (!html) return null;
  return URL.createObjectURL(new Blob([html], { type: "text/html" }));
}
