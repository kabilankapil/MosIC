// src/components/admin/PDFTemplates.jsx
//
// ─── Barrel re-export ────────────────────────────────────────
//
// All PDF logic has been split into focused modules under pdfTemplates/.
// This file re-exports everything so that every existing caller import
// (import { printInvoice, buildMatpassBlobUrl, … } from "../PDFTemplates")
// continues to work without any change.
//
// To import from a specific module directly (preferred for new code):
//   import { printSalesInvoice } from "./pdfTemplates/invoicePDF";
//   import { printOfferLetter }  from "./pdfTemplates/lettersPDF";
//   etc.

export * from "./pdfTemplates/invoicePDF";
export * from "./pdfTemplates/payslipPDF";
export * from "./pdfTemplates/lettersPDF";
export * from "./pdfTemplates/matpassPDF";

// openPrintWindow is used directly by a few callers (e.g. ActivityLog blob viewer)
export { openPrintWindow } from "./pdfTemplates/pdfShared";
