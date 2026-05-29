// ── employee/employeeConstants.js ─────────────────────────────────────────────

export function validateEmployeeForm(form) {
  const errs = {};
  if (!form.empName.trim())        errs.empName      = "First name is required.";
  if (!form.empLastName.trim())    errs.empLastName  = "Last name is required.";
  if (!form.empAddress1.trim())    errs.empAddress1  = "Address line 1 is required.";
  if (!form.empBankName.trim())    errs.empBankName  = "Bank name is required.";
  if (!form.empAccName.trim())     errs.empAccName   = "Account holder name is required.";

  if (!form.empPh.trim())
    errs.empPh = "Phone number is required.";
  else if (!/^\d{10}$/.test(form.empPh.trim()))
    errs.empPh = "Phone must be exactly 10 digits.";

  if (!form.empMail.trim())
    errs.empMail = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.empMail.trim()))
    errs.empMail = "Enter a valid email address.";

  if (!form.empPan.trim())
    errs.empPan = "PAN number is required.";
  else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.empPan.trim().toUpperCase()))
    errs.empPan = "PAN format: ABCDE1234F";

  if (!form.empAdhar.trim())
    errs.empAdhar = "Aadhaar is required.";
  else if (!/^\d{12}$/.test(form.empAdhar.trim()))
    errs.empAdhar = "Aadhaar must be exactly 12 digits.";

  if (!form.empIfscCode.trim())
    errs.empIfscCode = "IFSC code is required.";
  else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.empIfscCode.trim().toUpperCase()))
    errs.empIfscCode = "IFSC format: SBIN0001234";

  if (!form.empAccNo.trim())
    errs.empAccNo = "Account number is required.";
  else if (!/^\d+$/.test(form.empAccNo.trim()))
    errs.empAccNo = "Account number must contain digits only.";

  let dobDate = null, dojDate = null;
  if (!form.empDob)
    errs.empDob = "Date of birth is required.";
  else {
    dobDate = new Date(form.empDob);
    if (isNaN(dobDate.getTime())) { errs.empDob = "Enter a valid date of birth."; dobDate = null; }
  }
  if (!form.empDoj)
    errs.empDoj = "Date of joining is required.";
  else {
    dojDate = new Date(form.empDoj);
    if (isNaN(dojDate.getTime())) {
      errs.empDoj = "Enter a valid date of joining."; dojDate = null;
    } else if (dobDate && dojDate < dobDate) {
      errs.empDoj = "Date of Joining cannot be before Date of Birth.";
    }
  }
  return { errors: errs, isValid: Object.keys(errs).length === 0 };
}

export const FIELD_LABELS = {
  empName: "First Name", empLastName: "Last Name",
  empPh: "Phone", empMail: "Email",
  empPan: "PAN", empAdhar: "Aadhaar",
  empIfscCode: "IFSC Code", empAccNo: "Account Number",
  empAccName: "Account Holder Name", empBankName: "Bank Name",
  empAddress1: "Address Line 1",
  empDob: "Date of Birth", empDoj: "Date of Joining",
};

export const EMPTY_EMP = {
  empName: "", empLastName: "", empDob: "", empDoj: "",
  empPh: "", empMail: "", empPan: "", empAdhar: "",
  empAccNo: "", empBankName: "", empAccName: "", empIfscCode: "",
  empAddress1: "", empAddress2: "", empAddress3: "",
  status: "Active",
};

export const EMPTY_PS = {
  basic: "", hra: "", allowancess: "", tds: "", pt: "", loan: "",
};

export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export const currentYear = new Date().getFullYear();
export const YEARS = Array.from({ length: 10 }, (_, i) => String(currentYear - 2 + i));