// src/components/admin/party/partyShared.jsx
//
// Micro-components used in more than one party/ sub-component.
// Anything used in only one file lives there as a private function.

import { labelStyle } from "../shared/adminStyles";

// ── Type badge (Local / International) ───────────────────────────────────────
export function TypeBadge({ type }) {
  const isIntl = type === "International";
  return (
    <span style={{
      padding: "2px 9px", borderRadius: 4, fontSize: "0.72rem", fontWeight: 700,
      background: isIntl ? "rgba(155,77,255,0.18)" : "var(--a-teal-08)",
      color: isIntl ? "#c084fc" : "var(--a-teal)",
    }}>
      {type || "—"}
    </span>
  );
}

// ── Form field wrapper — label + children + per-field error ──────────────────
export function Field({ label, required, children, span2, error }) {
  return (
    <div style={{ gridColumn: span2 ? "1 / -1" : undefined }}>
      <label style={labelStyle}>
        {label}{required && <span style={{ color: "var(--a-danger)" }}> *</span>}
      </label>
      {children}
      {error && (
        <div style={{
          color: "var(--a-danger, #ef4444)", fontSize: "0.72rem", fontWeight: 600,
          marginTop: 4, display: "flex", alignItems: "center", gap: 4,
        }}>
          <span>⚠</span> {error}
        </div>
      )}
    </div>
  );
}
