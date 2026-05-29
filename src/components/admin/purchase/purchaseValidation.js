// src/components/admin/purchase/purchaseValidation.js
//
// Pure validation functions — no side-effects, no imports needed.
// Both functions return { errs, valid } so callers get a boolean
// without re-checking Object.keys(errs).length === 0.

// ─── Purchase-level ────────────────────────────────────────────
export function validatePurchaseForm(f) {
  const errs = {};

  if (!f.purchaseDate)
    errs.purchaseDate = "Purchase date is required.";

  if (!f.purchaseValidity)
    errs.purchaseValidity = "Validity date is required.";
  else if (f.purchaseDate && f.purchaseValidity < f.purchaseDate)
    errs.purchaseValidity = "Validity date cannot be before the purchase date.";

  if (!f.purchaseFromParty)
    errs.purchaseFromParty = "From Party is required.";

  if (!f.purchaseToParty)
    errs.purchaseToParty = "To Party is required.";
  else if (f.purchaseFromParty && String(f.purchaseFromParty) === String(f.purchaseToParty))
    errs.purchaseToParty = "From Party and To Party cannot be the same.";

  if (!f.purchaseEnquireDate)
    errs.purchaseEnquireDate = "Enquiry date is required.";

  if (!f.purchaseDeliveryTerms?.trim())
    errs.purchaseDeliveryTerms = "Delivery terms are required.";

  if (!f.purchasePaymentTerms?.trim())
    errs.purchasePaymentTerms = "Payment terms are required.";

  if (!f.purchaseCurrency)
    errs.purchaseCurrency = "Currency is required.";

  if (!f.purchaseDoctype)
    errs.purchaseDoctype = "Document type is required.";

  if (!f.purchaseTxType?.trim())
    errs.purchaseTxType = "Transaction type is required.";

  if (!f.purchaseAddressedTo)
    errs.purchaseAddressedTo = "Addressed To is required.";

  if (!f.purchaseFileRef)
    errs.purchaseFileRef = "File reference is required.";

  if (!f.purchaseDescription?.trim())
    errs.purchaseDescription = "Description is required.";

  return { errs, valid: Object.keys(errs).length === 0 };
}

// ─── Item-level ───────────────────────────────────────────────
// Field names match Purchase's internal model:
//   nameOfProductService, hsnAcs, quantity, unitRate, cgstRate, sgstRate, igstRate
// (Sales uses product, hsnCode — see salesValidation.js)
export function validateItemForm(f) {
  const errs = {};
  let valid = true;

  if (!f.nameOfProductService?.trim()) {
    errs.nameOfProductService = "Product / Service name is required.";
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

  if (f.hsnAcs && String(f.hsnAcs).trim() !== "" && !/^\d+$/.test(String(f.hsnAcs).trim())) {
    errs.hsnAcs = "HSN / ACS code must be numeric.";
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
