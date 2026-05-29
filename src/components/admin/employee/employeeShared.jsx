// ── employee/employeeShared.jsx ───────────────────────────────────────────────
import { labelStyle, inputStyle } from "../shared/adminStyles";

export function SectionLabel({ children }) {
  return (
    <div style={{
      gridColumn: "1 / -1", fontSize: "0.72rem", fontWeight: 800,
      letterSpacing: "0.08em", color: "var(--a-teal)",
      paddingTop: 8, paddingBottom: 4,
      borderBottom: "1px solid var(--a-teal-20)", marginBottom: 4,
    }}>{children}</div>
  );
}

export function Field({ label, required, children, span2, error }) {
  return (
    <div style={{ gridColumn: span2 ? "1 / -1" : undefined }}>
      <label style={labelStyle}>
        {label}{required && <span style={{ color: "var(--a-danger)" }}> *</span>}
      </label>
      {children}
      {error && (
        <span style={{
          display: "block", marginTop: 4, fontSize: "0.71rem",
          fontWeight: 600, color: "var(--a-danger, #ef4444)", lineHeight: 1.35,
        }}>⚠ {error}</span>
      )}
    </div>
  );
}

export function Inp({ value, onChange, type = "text", placeholder, disabled, hasError }) {
  return (
    <input type={type} className="activity-input"
      style={{
        ...inputStyle,
        ...(disabled   ? { opacity: 0.6, cursor: "not-allowed" }      : {}),
        ...(hasError   ? { borderColor: "var(--a-danger, #ef4444)" }  : {}),
      }}
      value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} />
  );
}

export function MoneyInp({ value, onChange }) {
  return (
    <input type="text" inputMode="decimal" className="activity-input"
      style={inputStyle} value={value} onChange={onChange} placeholder="0.00" />
  );
}