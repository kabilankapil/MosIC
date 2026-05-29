// src/components/admin/purchase/purchaseHelpers.jsx
//
// Small, stateless UI primitives shared across Purchase sub-components.
// Mirrors salesHelpers.jsx exactly — same components, same props API, same order.

import { labelStyle } from "../shared/adminStyles";

// ─── Error helpers ─────────────────────────────────────────────
// Exported functions so PurchaseFormFields, PurchaseItems, and any
// future sub-component can import once — no re-definition per file.

/** Returns a red-border style object when the field key has an error. */
export const errBorder = (key, errs) =>
  errs?.[key] ? { border: "1px solid var(--a-danger, #ef4444)" } : {};

/** Returns an inline error <span> for a field key, or null if no error. */
export const errText = (key, errs) =>
  errs?.[key]
    ? (
      <span style={{
        color: "var(--a-danger, #ef4444)",
        fontSize: "0.72rem", fontWeight: 600,
        marginTop: 4, display: "block", letterSpacing: "0.01em",
      }}>
        ⚠ {errs[key]}
      </span>
    )
    : null;

// ─── DocBadge ──────────────────────────────────────────────────
// Added to match salesHelpers — replaces inline <span> used in
// PurchaseDetailView and PurchaseItems summary strip.
export function DocBadge({ type }) {
  return (
    <span style={{
      background: "var(--a-teal-08)", color: "var(--a-teal)",
      padding: "2px 9px", borderRadius: 4,
      fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.02em",
    }}>
      {type || "—"}
    </span>
  );
}

// ─── ErrMsg ────────────────────────────────────────────────────
export function ErrMsg({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      color: "var(--a-danger)",
      background: "var(--a-danger-10)",
      border: "1px solid var(--a-danger-30)",
      borderRadius: 6, padding: "8px 14px", fontSize: "0.83rem", marginTop: 10,
    }}>
      ⚠ {msg}
    </div>
  );
}

// ─── Field ─────────────────────────────────────────────────────
// `error` prop — pass the error string directly from your errs object.
// Red border wraps the child input/select automatically when error is set —
// callers do not need to spread errBorder() separately onto the input.
export function Field({ label, required, children, span2, error }) {
  return (
    <div style={{ gridColumn: span2 ? "1 / -1" : undefined }}>
      <label style={{ ...labelStyle }}>
        {label}{required && <span style={{ color: "var(--a-danger)" }}> *</span>}
      </label>
      <div style={error ? { border: "1px solid var(--a-danger, #ef4444)", borderRadius: 6 } : {}}>
        {children}
      </div>
      {error && (
        <span style={{
          color: "var(--a-danger, #ef4444)",
          fontSize: "0.72rem", fontWeight: 600,
          marginTop: 4, display: "flex", alignItems: "center", gap: 4,
        }}>
          ⚠ {error}
        </span>
      )}
    </div>
  );
}

// ─── DetailRow ─────────────────────────────────────────────────
export function DetailRow({ label, value, teal }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{
        fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.07em",
        textTransform: "uppercase", color: "var(--a-text-faint)",
      }}>
        {label}
      </span>
      <span style={{
        fontSize: "0.875rem",
        color: teal ? "var(--a-teal)" : "var(--a-text)",
        fontWeight: teal ? 700 : 400,
        wordBreak: "break-word",
      }}>
        {value || "—"}
      </span>
    </div>
  );
}

// ─── InfoCard ──────────────────────────────────────────────────
export function InfoCard({ label, value, teal, icon }) {
  return (
    <div style={{
      background: "var(--a-surface-solid)",
      border: "1px solid var(--a-teal-20)",
      borderRadius: 10, padding: "16px 20px",
    }}>
      <p style={{
        margin: "0 0 6px", fontSize: "0.68rem", fontWeight: 800,
        letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--a-text-faint)",
      }}>
        {icon && <span style={{ marginRight: 5 }}>{icon}</span>}{label}
      </p>
      <p style={{
        margin: 0, fontSize: "1.05rem", fontWeight: 700,
        color: teal ? "var(--a-teal)" : "var(--a-text)",
      }}>
        {value || "—"}
      </p>
    </div>
  );
}

// ─── SectionCard ───────────────────────────────────────────────
export function SectionCard({ title, children, noMargin }) {
  return (
    <div style={{
      background: "var(--a-teal-05)", border: "1px solid var(--a-teal-20)",
      borderRadius: 10, padding: "18px 22px", marginBottom: noMargin ? 0 : 14,
    }}>
      <p style={{
        margin: "0 0 14px", fontSize: "0.68rem", fontWeight: 800,
        letterSpacing: "0.08em", color: "var(--a-teal)", textTransform: "uppercase",
      }}>
        {title}
      </p>
      {children}
    </div>
  );
}
