// ── stocks/stocksConstants.js ─────────────────────────────────────────────────
import { localDate } from "../shared/adminStyles";

export const IN_OUT_OPTIONS  = ["IN", "OUT"];
export const RETURN_OPTIONS  = ["NON-RETURN", "RETURN"];

export const errStyle = {
  color:         "var(--a-danger, #ef4444)",
  fontSize:      "0.72rem",
  fontWeight:    600,
  marginTop:     4,
  display:       "block",
  letterSpacing: "0.01em",
};

export const errBorder = (hasErr) =>
  hasErr ? { borderColor: "var(--a-danger, #ef4444)" } : {};

export const emptyItemForm = () => ({
  productName:      "",
  smUnit:           "",
  smOpeningBalance: "0",
  openingDate:      localDate(),
  smDescription:    "",
  status:           1,
});

export const emptyItemErrors = () => ({
  productName: "", smUnit: "", smOpeningBalance: "", openingDate: "", smDescription: "",
});

export const emptyMovementForm = () => ({
  stockItemId:            "",
  stockDate:              localDate(),
  stockInOut:             "IN",
  stockQuantity:          "",
  stockReturnOrNonReturn: "NON-RETURN",
  stockParty:             "",
  matPassId:              "",
  stockDescription:       "",
  status:                 1,
});

export const emptyMovementErrors = () => ({
  stockItemId: "", stockDate: "", stockQuantity: "",
  stockParty: "", matPassId: "", stockDescription: "",
});

export function buildBalanceMap(items, movements) {
  const map = {};
  for (const item of items) {
    const opening  = Number(item.smOpeningBalance) || 0;
    const itemMovs = movements.filter(
      m => String(m.stockItemId) === String(item.id) && Number(m.status) !== 0
    );
    const ins  = itemMovs
      .filter(m => (m.stockInOut || "").toUpperCase() === "IN")
      .reduce((s, m) => s + (Number(m.stockQuantity) || 0), 0);
    const outs = itemMovs
      .filter(m => (m.stockInOut || "").toUpperCase() === "OUT")
      .reduce((s, m) => s + (Number(m.stockQuantity) || 0), 0);
    map[item.id] = opening + ins - outs;
  }
  return map;
}

export function validateItemForm(f) {
  const errs = {};
  if (!f.productName?.trim())
    errs.productName = "Product name is required.";
  if (!f.smUnit?.trim())
    errs.smUnit = "Unit of measurement is required.";
  if (!f.openingDate)
    errs.openingDate = "Opening date is required.";
  if (f.smOpeningBalance === "" || f.smOpeningBalance === null || f.smOpeningBalance === undefined)
    errs.smOpeningBalance = "Opening balance is required.";
  else if (isNaN(Number(f.smOpeningBalance)) || Number(f.smOpeningBalance) < 0)
    errs.smOpeningBalance = "Opening balance must be a non-negative number.";
  if (!f.smDescription?.trim())
    errs.smDescription = "Description is required.";
  return errs;
}

export function validateMovementForm(f) {
  const errs = {};
  if (!f.stockItemId)
    errs.stockItemId = "Please select a stock item.";
  if (!f.stockDate)
    errs.stockDate = "Date is required.";
  if (!f.stockQuantity && f.stockQuantity !== 0)
    errs.stockQuantity = "Quantity is required.";
  else if (isNaN(Number(f.stockQuantity)) || Number(f.stockQuantity) <= 0)
    errs.stockQuantity = "Quantity must be greater than 0.";
  if (!f.stockParty)
    errs.stockParty = "Party is required.";
  if (!f.matPassId)
    errs.matPassId = "MAT Pass is required.";
  if (!f.stockDescription?.trim())
    errs.stockDescription = "Description is required.";
  return errs;
}