// src/components/admin/pdfTemplates/pdfShared.js
//
// Shared primitives used by every PDF module:
//   • Company constants (CO, LOGO_SRC)
//   • Base CSS reset
//   • Date / number / HTML-escape helpers
//   • Indian number-to-words
//   • Auth / fetch helpers (authHeaders, apiGet)
//   • Pop-up helper (openPrintWindow)
//   • PDF persistence helpers (savePdfBlob, linkPdfToRecord)
//   • Shared HTML header blocks (invoiceCoHeader, letterCoHeader, letterFooter)
//
// Nothing in this file renders JSX — plain JS only.

import { BASE_URL } from "../../../api/_base";

// ── Company constants ─────────────────────────────────────────
//
// CO      — full details (GST, CIN, PAN) used by Sales / Purchase / Matpass PDFs
// CO_HR   — HR-only details (name, address, website, phone, email) used by
//           payslip and all HR letter PDFs (no tax registration numbers)
//
export const CO = {
  name:    "MosIC Solutions Pvt Ltd",
  addr1:   "No:93/9, Novel MSR Park office, Marthahalli,",
  addr2:   "Bangalore 560037",
  state:   "Karnataka",
  gst:     "29AAICM6836G1Z3",
  pan:     "AAICM6836G",
  cin:     "U72200KA2013PTC069886",
  website: "www.mosics.com",
  phone:   "+91-9980914698",
  email:   "salesandsupport@mosics.com",
};

// HR PDFs only need name + address + contact — no tax registration numbers.
export const CO_HR = {
  name:    CO.name,
  addr1:   CO.addr1,
  //addr2:   CO.addr2,
  addr2: `${CO.addr2}, ${CO.state}`,
  website: CO.website,
  phone:   CO.phone,
  email:   CO.email,
};

// Served from public/images/logo.jpg.
// window.location.origin gives an absolute URL that works in popup windows
// and blob: URL iframes alike.
export const LOGO_SRC = `${window.location.origin}/images/logo.jpg`;

// ── Month names (for payslip header) ─────────────────────────
export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ── Base CSS reset (extended by each theme) ───────────────────
export const BASE_CSS = `
 * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#111;
         background:#fff; padding:20px; }
  @media print {
   @page { size:A4; margin:14mm 10mm; }
  @page { margin-header: 0; margin-footer: 0; }
  body { padding:12mm 10mm; }
  .no-print { display:none !important; }
  html { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  }
`;

// ── Date helpers ──────────────────────────────────────────────
/** "dd-mm-yyyy" */
export function todayDash() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`;
}

/** "dd/mm/yyyy" */
export function todayStr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

/** Normalises ISO / dd-mm-yyyy / mixed strings → "dd-mm-yyyy" */
export function fmtDate(val) {
  if (!val) return "—";
  const datePart = val.split("T")[0].split(" ")[0];
  const parts    = datePart.split("-");
  if (parts.length === 3 && parts[0].length === 4)
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return datePart;
}

/** Indian locale currency format, always 2 dp */
export function fmtINR(n) {
  return Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** HTML-escape a value (safe default for template literals) */
export const esc = (s) =>
  String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

// ── Logo helper ───────────────────────────────────────────────
export function logoImgTag(size = 72) {
  return `<img src="${LOGO_SRC}" alt="MosIC Logo"
    style="width:${size}px;height:${size}px;object-fit:contain;flex-shrink:0;" />`;
}

// ── Number → words (Indian system) ───────────────────────────
const _ONES = [
  "","one","two","three","four","five","six","seven","eight","nine",
  "ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen",
  "seventeen","eighteen","nineteen",
];
const _TENS = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];

function _belowHundred(n) {
  return n < 20
    ? _ONES[n]
    : _TENS[Math.floor(n / 10)] + (n % 10 ? " " + _ONES[n % 10] : "");
}

function _belowThousand(n) {
  return n < 100
    ? _belowHundred(n)
    : _ONES[Math.floor(n / 100)] + " hundred" + (n % 100 ? " and " + _belowHundred(n % 100) : "");
}

export function numberToWords(amount) {
  const n = Math.round(Number(amount) || 0);
  if (n === 0) return "zero rupees";
  let rem = n, parts = [];
  if (rem >= 10_000_000) { parts.push(_belowThousand(Math.floor(rem / 10_000_000)) + " crore");   rem %= 10_000_000; }
  if (rem >= 100_000)    { parts.push(_belowThousand(Math.floor(rem / 100_000))    + " lakh");     rem %= 100_000;    }
  if (rem >= 1_000)      { parts.push(_belowThousand(Math.floor(rem / 1_000))      + " thousand"); rem %= 1_000;      }
  if (rem > 0)             parts.push(_belowThousand(rem));
  return parts.join(" ") + " rupees";
}

// ── Auth / fetch helpers ──────────────────────────────────────
function authHeaders() {
  const token = sessionStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`GET ${path} → HTTP ${res.status}`);
  return res.json();
}

// ── Pop-up helper ─────────────────────────────────────────────
export function openPrintWindow(html) {
  const win = window.open("", "_blank", "width=960,height=750,scrollbars=yes");
  if (!win) {
    alert("Pop-up blocked — please allow pop-ups for this site.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  setTimeout(() => {
    try { win.focus(); win.document.head.insertAdjacentHTML("beforeend",
  `<style>@page { margin: 14mm 10mm; }</style>`
); win.print(); } catch { /* already triggered or blocked */ }
  }, 650);
}

// ── PDF persistence helpers ───────────────────────────────────
// savePdfBlob: uploads HTML as a blob file and returns the server-assigned blob ID.
// linkPdfToRecord: PATCHes the record's pdfBlobId field (best-effort, never throws).
export async function savePdfBlob(htmlContent, filename) {
  try {
    const blob = new Blob([htmlContent], { type: "text/html" });
    const file = new File([blob], filename, { type: "text/html" });
    const fd   = new FormData();
    fd.append("file", file);
    const token = sessionStorage.getItem("auth_token");
    const res   = await fetch(`${BASE_URL}/api/blobs`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.id || null;
  } catch { return null; }
}

export async function linkPdfToRecord(type, id, blobId) {
  if (!blobId) return;
  try {
    const token = sessionStorage.getItem("auth_token");
    await fetch(`${BASE_URL}/api/${type}/${id}/pdf-blob`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ pdfBlobId: blobId }),
    });
  } catch { /* best-effort */ }
}

// ── Shared HTML header blocks ─────────────────────────────────
// invoiceCoHeader  → used by invoicePDF (teal invoice / purchase theme)
// letterCoHeader   → used by lettersPDF (all HR letter types)
// letterFooter     → used by lettersPDF (signature + declaration block)

export function invoiceCoHeader() {
  return `<div class="hdr">
    ${logoImgTag(72)}
    <div class="hdr-center">
      <div class="co-name">${CO.name}</div>
      <div class="co-meta">${CO.addr1}<br/>${CO.addr2}</div>
      <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:10px; color:#444; line-height:1.85;">
        <div>
          GST No: ${CO.gst}<br/>
          CIN No: ${CO.cin}<br/>
          Phone: ${CO.phone}
        </div>
        <div style="text-align:right; margin-right:300px;">
          PAN No: ${CO.pan}<br/>
          Website: ${CO.website}<br/>
          Email: ${CO.email}
        </div>
      </div>
    </div>
  </div>`;
}

export function letterCoHeader() {
  return `<div class="hdr">
    <div class="hdr-left">
      ${logoImgTag(80)}
      <div>
        <div class="co-name">${CO.name}</div>
        <div class="co-meta">
          ${CO.addr1} ${CO.addr2}<br/>
          GST: ${CO.gst} &nbsp;|&nbsp; PAN: ${CO.pan}<br/>
          CIN: ${CO.cin} &nbsp;|&nbsp; Website: ${CO.website}<br/>
          Phone: ${CO.phone} &nbsp;|&nbsp; Email: ${CO.email}
        </div>
      </div>
    </div>
  </div>`;
}

// HR letter header — no GST / CIN / PAN (used by lettersPDF and payslipPDF)
export function letterCoHeaderHR() {
  return `<div class="hdr">
    <div class="hdr-left">
      ${logoImgTag(80)}
      <div>
        <div class="co-name">${CO_HR.name}</div>
        <div class="co-meta">
          ${CO_HR.addr1} ${CO_HR.addr2}<br/>
          Website: ${CO_HR.website}<br/>
          Phone: ${CO_HR.phone} &nbsp;|&nbsp; Email: ${CO_HR.email}
        </div>
      </div>
    </div>
  </div>`;
}

// FIXED — wrapped in a single container so they never split across pages
export function letterFooter() {
  return `<div style="page-break-inside:avoid; break-inside:avoid;">
    <div class="sign-section">
      <p>Sincerely,<br/>for MosIC solution(p)Ltd</p>
      <div style="margin-top:50px"><strong>Managing Director</strong></div>
    </div>
    <div class="declare">
      <strong>Declaration &amp; Acknowledgment from Employee:</strong><br/>
      &nbsp;I have read, understood and agree to accept employment on the terms and conditions herein.<br/><br/>
      I shall be reporting to duty on _______________________
      <div class="field-row">
        <p>Name &nbsp;&nbsp;&nbsp;:</p>
        <p>Signature:</p>
        <p>Date &nbsp;&nbsp;&nbsp;:</p>
        <p>Place &nbsp;&nbsp;&nbsp;:</p>
      </div>
    </div>
  </div>`;
}
