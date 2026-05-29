// src/components/admin/pdfTemplates/payslipPDF.js
//
// Payslip PDFs:
//   buildPayslipHtml      — returns raw HTML string (HR.jsx uses this directly)
//   printPayslip          — build + open print popup
//   printPayslipFromRecord — re-print a saved payslip record

import { CO_HR, MONTHS, BASE_CSS, logoImgTag, letterCoHeaderHR, openPrintWindow } from "./pdfShared";

// ── Payslip theme ─────────────────────────────────────────────
const PAYSLIP_CSS = `${BASE_CSS}
  body { padding:24px 28px; }
  .hdr { display:flex; justify-content:space-between; align-items:flex-start;
         border-bottom:2.5px solid #0f766e; padding-bottom:12px; margin-bottom:12px; }
  .hdr-left { display:flex; align-items:flex-start; gap:12px; }
  .hdr-right { text-align:right; font-size:10px; color:#444;
               line-height:1.7; flex-shrink:0; margin-left:12px; }
  .hdr-right .stamp { font-size:12px; font-weight:800; color:#0f766e; margin-bottom:2px; }
  .co-name { font-size:22px; font-weight:900; color:#0f766e; margin-bottom:4px; }
  .co-meta { font-size:10px; line-height:1.7; color:#333; }
  .title  { text-align:center; font-size:18px; font-weight:bold;
            letter-spacing:2px; margin:10px 0; }
  .month  { text-align:center; font-size:15px; font-weight:bold;
            border-top:2px solid #0f766e; border-bottom:2px solid #0f766e;
            padding:6px 0; margin-bottom:12px; letter-spacing:1px; color:#0f766e; }
  .emp-info { display:grid; grid-template-columns:1fr 1fr;
              gap:4px 20px; margin-bottom:14px; font-size:11px; }
  .lbl { font-weight:700; }
  table.main { width:100%; border-collapse:collapse; margin-top:12px; }
  table.main th { border:1.5px solid #0f766e; padding:8px 10px;
                  background:#e6f7f5; font-weight:700; font-size:13px;
                  text-align:center; letter-spacing:0.5px; color:#0f766e; }
  table.main td { border:1px solid #ccc; padding:6px 10px;
                  font-size:11.5px; vertical-align:top; }
  .total-row td { font-weight:700; font-size:12px; background:#f0fffe; }
`;

// ── Payslip HTML builder ──────────────────────────────────────
export function buildPayslipHtml(employee, position, payMonth, payYear, refId) {
  const empName    = `${employee.empName || ""} ${employee.empLastName || ""}`.trim();
  const basic      = parseFloat(position.empBasic      || position.basic       || 0);
  const hra        = parseFloat(position.empHra        || position.hra         || 0);
  const allowance  = parseFloat(position.empAllowance  || position.allowancess || 0);
  const gross      = parseFloat(position.empMonthGross || position.totalGross  || (basic + hra + allowance));
  const tds        = parseFloat(position.empTds  || position.tds  || 0);
  const pt         = parseFloat(position.empPt   || position.pt   || 0);
  const loans      = parseFloat(position.empLoans || position.loan || 0);
  const deductions = tds + pt + loans;
  const netSalary  = gross - deductions;
  const monthLabel = `${(MONTHS[(Number(payMonth) || 1) - 1] || "").toUpperCase()}-${payYear}`;
  const today      = new Date().toISOString().replace("T", " ").slice(0, 19);

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>Payslip – ${empName} – ${monthLabel}</title>
<style>${PAYSLIP_CSS}</style>
</head><body>
  ${letterCoHeaderHR()}
  <div class="title">PAYSLIP</div>
  <div class="month">PAYSLIP FOR THE MONTH OF — ${monthLabel}</div>
  <div class="emp-info">
    <div><span class="lbl">EMPLOYEE ID :</span>&nbsp; ${employee.id || "—"}</div>
    <div><span class="lbl">DATE :</span>&nbsp; ${today}</div>
    <div><span class="lbl">PAN CARD NO :</span>&nbsp; ${employee.empPan || "—"}</div>
    <div><span class="lbl">DESIGNATION :</span>&nbsp; ${position.position || position.empPosition || "—"}</div>
    <div><span class="lbl">PAYSLIP REF :</span>&nbsp; ${refId || "—"}</div>
    <div><span class="lbl">EMAIL :</span>&nbsp; ${employee.empMail || "—"}</div>
    <div><span class="lbl">EMPLOYEE NAME :</span>&nbsp; ${empName}</div>
  </div>
  <table class="main">
    <thead>
      <tr><th>PAYMENTS</th><th>DEDUCTIONS</th><th>BANK DETAILS</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>
          FIXED PAY &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${basic.toLocaleString("en-IN")}<br/>
          HRA &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${hra.toLocaleString("en-IN") || "00"}<br/>
          ALLOWANCES &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${allowance.toLocaleString("en-IN") || "0"}
        </td>
        <td>
          PROFESSIONAL TAX &nbsp; ${pt.toLocaleString("en-IN") || "0"}<br/>
          TDS DEDUCTIONS &nbsp;&nbsp;&nbsp;&nbsp; ${tds.toLocaleString("en-IN") || "0"}<br/>
          OTHER DEDUCTIONS &nbsp; ${loans.toLocaleString("en-IN") || "0"}
        </td>
        <td>
          ${employee.empAccNo || "—"}<br/>BANK ACCOUNT NO<br/>
          ${employee.empIfscCode || "—"}<br/>BANK BRANCH IFSC CODE<br/>
          ${employee.empBankName || "—"}
        </td>
      </tr>
      <tr class="total-row">
        <td>GROSS RS. &nbsp; ${gross.toFixed(2)}</td>
        <td>DEDUCTIONS RS. &nbsp; ${deductions.toFixed(2)}</td>
        <td>NET SALARY RS. &nbsp; ${netSalary.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>
</body></html>`;
}

// ── Print functions ───────────────────────────────────────────

export function printPayslip({ employee, position, payMonth, payYear, refId }) {
  openPrintWindow(buildPayslipHtml(employee, position, payMonth, payYear, refId));
}

/**
 * Re-prints a stored payslip record.
 * The record shape comes from the payslips DB table via the API.
 */
export function printPayslipFromRecord({ employee, currentPosition, record }) {
  openPrintWindow(buildPayslipHtml(
    employee,
    {
      position:       currentPosition?.position || "—",
      basic:          record.basic,
      hra:            record.hra,
      allowancess:    record.allowancess,
      totalGross:     record.totalGross,
      tds:            record.tds,
      pt:             record.pt,
      loan:           record.loan,
      totalDeduction: record.totalDeduction,
    },
    Number(record.empMonth),
    Number(record.empYear),
    record.id,
  ));
}
