// src/components/admin/party/partyValidation.js
//
// Field-level validation for both customer and contact forms.
// VALIDATORS is kept private — only validateFields is exported.

const VALIDATORS = {
  pan:           { re: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,                                    msg: "PAN: 5 letters · 4 digits · 1 letter  (e.g. AAAAA0000A)" },
  gst:           { re: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,  msg: "GST: 15-char format  (e.g. 29AAAAA0000A1Z5)" },
  cin:           { re: /^[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/,              msg: "CIN format invalid  (e.g. U72200KA2013PTC069886)" },
  tan:           { re: /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/,                                   msg: "TAN: 4 letters · 5 digits · 1 letter  (e.g. BLRM12345A)" },
  ifscCode:      { re: /^[A-Z]{4}0[A-Z0-9]{6}$/,                                        msg: "IFSC: 4 letters · 0 · 6 alphanumeric  (e.g. SBIN0001234)" },
  contactNumber: { re: /^[5-9][0-9]{9}$/,                                                msg: "Phone: 10 digits starting with 5–9" },
  phone:         { re: /^[5-9][0-9]{9}$/,                                                msg: "Phone: 10 digits starting with 5–9" },
  email:         { re: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,                                    msg: "Enter a valid email address" },
  cGstLutNo:     { re: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,  msg: "GST LUT No: 15-char format  (e.g. 29AAAAA0000A1Z5)" },
};

/**
 * Validate a form data object against a list of required fields
 * and the VALIDATORS regex map.
 *
 * @param {Object} formData       - key/value pairs from the form state
 * @param {string[]} requiredFields - field names that must not be empty
 * @returns {{ errors: Object, isValid: boolean }}
 */
export function validateFields(formData, requiredFields = []) {
  const errors = {};

  for (const field of requiredFields) {
    if (!formData[field]?.trim()) {
      errors[field] = "This field is required.";
    }
  }

  for (const [field, { re, msg }] of Object.entries(VALIDATORS)) {
    const val = (formData[field] || "").trim();
    if (val && !re.test(val)) {
      errors[field] = msg;
    }
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}
