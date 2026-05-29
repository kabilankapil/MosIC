// src/components/admin/sales/salesValidation.js
//
// Pure validation functions — no side-effects, no imports needed.
// Both functions return { errs, valid } so callers get a boolean
// without re-checking Object.keys(errs).length === 0.

// ─── Sale-level ────────────────────────────────────────────────
export function validateSaleForm(f) {
  const errs = {};

  if (!f.date)
    errs.date = "Sales date is required.";

  if (!f.validity)
    errs.validity = "Validity date is required.";
  else if (f.date && f.validity < f.date)
    errs.validity = "Validity date cannot be before the sales date.";

  if (!f.fromParty)
    errs.fromParty = "From Party is required.";

  if (!f.toParty)
    errs.toParty = "To Party is required.";
  else if (f.fromParty && String(f.fromParty) === String(f.toParty))
    errs.toParty = "From Party and To Party cannot be the same.";

  if (!f.enquiryDate)
    errs.enquiryDate = "Enquiry date is required.";

  if (!f.deliveryTerms?.trim())
    errs.deliveryTerms = "Delivery terms are required.";

  if (!f.paymentTerms?.trim())
    errs.paymentTerms = "Payment terms are required.";

  if (!f.currency)
    errs.currency = "Currency is required.";

  if (!f.documentType)
    errs.documentType = "Document type is required.";

  if (!f.transactionType?.trim())
    errs.transactionType = "Transaction type is required.";

  if (!f.addressedTo)
    errs.addressedTo = "Addressed To is required.";

  if (!f.fileReference)
    errs.fileReference = "File reference is required.";

  if (!f.description?.trim())
    errs.description = "Description is required.";

  return { errs, valid: Object.keys(errs).length === 0 };
}

// ─── Line-item level ───────────────────────────────────────────
// Field names match Sales' internal model:
//   product, hsnCode, quantity, unitRate, cgstRate, sgstRate, igstRate
// (Purchase uses nameOfProductService, hsnAcs — see purchaseValidation.js)
export function validateLineItem(f) {
  const errs = {};
  let valid = true;

  if (!f.product?.trim()) {
    errs.product = "Product / Service name is required.";
    valid = false;
  }

  const qty = Number(f.quantity);
  if (f.quantity === "" || f.quantity === null || f.quantity === undefined) {
    errs.quantity = "Quantity is required.";
    valid = false;
  } else if (isNaN(qty) || qty <= 0) {
    errs.quantity = "Quantity must be greater than 0.";
    valid = false;
  }

  const rate = Number(f.unitRate);
  if (f.unitRate === "" || f.unitRate === null || f.unitRate === undefined) {
    errs.unitRate = "Unit rate is required.";
    valid = false;
  } else if (isNaN(rate) || rate <= 0) {
    errs.unitRate = "Unit rate must be greater than 0.";
    valid = false;
  }

  if (f.hsnCode && f.hsnCode.trim() !== "" && !/^\d+$/.test(f.hsnCode.trim())) {
    errs.hsnCode = "HSN / SAC code must be numeric.";
    valid = false;
  }

  const checkNeg = (key, label) => {
    const v = Number(f[key]);
    if (f[key] !== "" && f[key] !== null && f[key] !== undefined && !isNaN(v) && v < 0) {
      errs[key] = `${label} cannot be negative.`;
      valid = false;
    }
  };
  checkNeg("cgstRate", "CGST Rate");
  checkNeg("sgstRate", "SGST Rate");
  checkNeg("igstRate", "IGST Rate");

  return { errs, valid };
}
