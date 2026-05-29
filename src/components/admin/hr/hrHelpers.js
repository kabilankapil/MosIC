// src/components/admin/hr/hrHelpers.js

import { buildPayslipHtml, openPrintWindow } from "../PDFTemplates";

/** Returns today as "yyyy-MM-dd" (local time). */
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

/** Convert "yyyy-MM-dd" → "DD/MM/YYYY" for display. */
export function isoToDisplay(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/**
 * Validate the position form.
 * @param {Object} form
 * @returns {{ errors: Object, isValid: boolean }}
 */
export function validatePositionForm(form) {
  const errs = {};
  if (!form.position.trim())  errs.position        = "Position title is required.";
  if (!form.epEfficientDate)  errs.epEfficientDate  = "Effective date is required.";
  return { errors: errs, isValid: Object.keys(errs).length === 0 };
}

/**
 * Build a single HTML document containing multiple payslip pages.
 * @param {Object} employee
 * @param {Object|null} currentPos — current active position (for title)
 * @param {Array}  slips  — payslip records to include
 * @returns {string} full HTML string ready for openPrintWindow
 */
export function buildCombinedPayslipsHtml(employee, currentPos, slips) {
  const empName = `${employee.empName || ""} ${employee.empLastName || ""}`.trim();
  const pages   = slips.map((ps) => {
    const posShape = {
      position:     currentPos?.position  || "—",
      basic:        ps.basic,
      hra:          ps.hra,
      allowancess:  ps.allowancess,
      totalGross:   ps.totalGross,
      tds:          ps.tds,
      pt:           ps.pt,
      loan:         ps.loan,
    };
    return buildPayslipHtml(employee, posShape, Number(ps.empMonth), Number(ps.empYear), ps.id);
  });

  const bodies = pages.map((html) => {
    const m = html.match(/<body>([\s\S]*)<\/body>/i);
    return m ? m[1] : html;
  });
  const style = pages[0]?.match(/<style>([\s\S]*?)<\/style>/i)?.[1] || "";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>` +
    `<title>Combined Payslips – ${empName}</title>` +
    `<style>${style} .page-break { page-break-after: always; }</style></head><body>` +
    bodies.map((b, i) =>
      `<div>${b}${i < bodies.length - 1 ? '<div class="page-break"></div>' : ""}</div>`
    ).join("") +
    `</body></html>`;
}

/**
 * Open the print window with the last N payslips combined.
 */
export function printLastNPayslips(employee, currentPosition, payslips, n) {
  const slips = [...payslips]
    .sort((a, b) => {
      const ya = Number(a.empYear),  yb = Number(b.empYear);
      const ma = Number(a.empMonth), mb = Number(b.empMonth);
      return yb !== ya ? yb - ya : mb - ma;
    })
    .slice(0, n);
  openPrintWindow(buildCombinedPayslipsHtml(employee, currentPosition, slips));
}
