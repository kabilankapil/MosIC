// src/components/admin/activityLog/activityLogConstants.js
//
// Shared constants and helpers for ActivityLog and its sub-components.

import { localDate } from "../shared/adminStyles";

// ─── Purchase doctype labels (mirrors Purchase.jsx / purchaseConstants.js) ──
export const PURCHASE_DOCTYPE_OPTIONS = [
  { value: "1", label: "Enquiry" },
  { value: "2", label: "Quotation" },
  { value: "3", label: "Purchase Order" },
  { value: "4", label: "Invoice" },
  { value: "5", label: "Delivery Note" },
];

export const purchaseDoctypeLabel = (v) =>
  PURCHASE_DOCTYPE_OPTIONS.find((o) => o.value === String(v))?.label ?? String(v ?? "—");

// ─── Empty form factories ─────────────────────────────────────
export const emptyActForm = () => ({
  date: localDate(),
  status: "ACTIVE",
  description: "",
});
