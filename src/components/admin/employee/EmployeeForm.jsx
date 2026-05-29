// ── employee/EmployeeForm.jsx ─────────────────────────────────────────────────
import { inputStyle, editCardStyle } from "../shared/adminStyles";
import Btn        from "../shared/Btn";
import DatePicker from "../DatePicker";
import { SectionLabel, Field, Inp } from "./employeeShared";

export default function EmployeeForm({ form, f, errors, saving, editEmp, onSave, onBack }) {
  const isEdit = !!editEmp;
  return (
    <div className="content-section">
      <div className="activity-header" style={{ alignItems: "center", marginBottom: 20 }}>
        <div className="act-breadcrumb">
          <button onClick={onBack} className="act-back-btn">← Employees</button>
          <span className="act-breadcrumb-label">
            / <strong>{isEdit ? `Edit — ${editEmp.empName} ${editEmp.empLastName}` : "New Employee"}</strong>
          </span>
        </div>
      </div>

      <div style={{ ...editCardStyle, maxWidth: 820 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
          <SectionLabel>👤 Personal Information</SectionLabel>

          <Field label="First Name" required error={errors.empName}>
            <Inp value={form.empName} onChange={f("empName")} placeholder="First name" hasError={!!errors.empName} />
          </Field>
          <Field label="Last Name" required error={errors.empLastName}>
            <Inp value={form.empLastName} onChange={f("empLastName")} placeholder="Last name" hasError={!!errors.empLastName} />
          </Field>

          <Field label="Date of Birth" required error={errors.empDob}>
            <DatePicker label="" required value={form.empDob} onChange={f("empDob")} />
          </Field>
          <Field label="Date of Joining" required error={errors.empDoj}>
            <DatePicker label="" required value={form.empDoj} onChange={f("empDoj")} />
          </Field>

          <Field label="Phone No" required error={errors.empPh}>
            <Inp value={form.empPh} onChange={f("empPh")} placeholder="e.g. 9876543210" hasError={!!errors.empPh} />
          </Field>
          <Field label="Email" required error={errors.empMail}>
            <Inp type="email" value={form.empMail} onChange={f("empMail")} placeholder="employee@example.com" hasError={!!errors.empMail} />
          </Field>

          <Field label="PAN No" required error={errors.empPan}>
            <Inp value={form.empPan} onChange={f("empPan")} placeholder="ABCDE1234F" hasError={!!errors.empPan} />
          </Field>
          <Field label="Aadhaar" required error={errors.empAdhar}>
            <Inp value={form.empAdhar} onChange={f("empAdhar")} placeholder="12-digit Aadhaar" hasError={!!errors.empAdhar} />
          </Field>

          <Field label="Status" span2>
            <select className="activity-input" style={inputStyle} value={form.status} onChange={f("status")}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </Field>

          <SectionLabel>📍 Address</SectionLabel>
          <Field label="Address Line 1" required span2 error={errors.empAddress1}>
            <Inp value={form.empAddress1} onChange={f("empAddress1")} placeholder="Street / locality" hasError={!!errors.empAddress1} />
          </Field>
          <Field label="Address Line 2" span2>
            <Inp value={form.empAddress2} onChange={f("empAddress2")} placeholder="City, State" />
          </Field>
          <Field label="Address Line 3" span2>
            <Inp value={form.empAddress3} onChange={f("empAddress3")} placeholder="PIN code / country" />
          </Field>

          <SectionLabel>🏦 Bank Details</SectionLabel>
          <Field label="Bank Name" required error={errors.empBankName}>
            <Inp value={form.empBankName} onChange={f("empBankName")} placeholder="e.g. SBI" hasError={!!errors.empBankName} />
          </Field>
          <Field label="Account Holder Name" required error={errors.empAccName}>
            <Inp value={form.empAccName} onChange={f("empAccName")} placeholder="As on passbook" hasError={!!errors.empAccName} />
          </Field>
          <Field label="Account Number" required error={errors.empAccNo}>
            <Inp value={form.empAccNo} onChange={f("empAccNo")} placeholder="Account number" hasError={!!errors.empAccNo} />
          </Field>
          <Field label="IFSC Code" required error={errors.empIfscCode}>
            <Inp value={form.empIfscCode} onChange={f("empIfscCode")} placeholder="e.g. SBIN0001234" hasError={!!errors.empIfscCode} />
          </Field>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <Btn variant="primary" onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Update Employee" : "Save Employee"}
          </Btn>
          <Btn variant="ghost" onClick={onBack}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}