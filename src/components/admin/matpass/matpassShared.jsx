// src/components/admin/matpass/matpassShared.jsx
//
// Presentational micro-components used in more than one matpass/ file.

// ── Status / direction / availability badges ─────────────────────────────────

export function StatusBadge({ status }) {
  const active = Number(status) === 1;
  return (
    <span style={{
      background: active ? "rgba(20,184,166,0.12)" : "rgba(239,68,68,0.10)",
      color: active ? "var(--a-teal)" : "var(--a-danger)",
      border: `1px solid ${active ? "var(--a-teal-30)" : "rgba(239,68,68,0.3)"}`,
      borderRadius: 20, padding: "2px 10px",
      fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap",
    }}>
      {active ? "Active" : "Closed"}
    </span>
  );
}

export function DirectionBadge({ value }) {
  const isIn = (value || "").toUpperCase() === "IN";
  return (
    <span style={{
      background: isIn ? "rgba(34,197,94,0.12)" : "rgba(249,115,22,0.12)",
      color: isIn ? "#22c55e" : "#f97316",
      border: `1px solid ${isIn ? "rgba(34,197,94,0.3)" : "rgba(249,115,22,0.3)"}`,
      borderRadius: 20, padding: "2px 10px",
      fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap",
    }}>
      {value || "—"}
    </span>
  );
}

export function AvailBadge({ value }) {
  const n      = Number(value) || 0;
  const color  = n > 0 ? "#22c55e" : n < 0 ? "var(--a-danger)" : "var(--a-text-faint)";
  const bg     = n > 0 ? "rgba(34,197,94,0.10)" : n < 0 ? "rgba(239,68,68,0.08)" : "rgba(0,0,0,0.04)";
  const border = n > 0 ? "rgba(34,197,94,0.3)"  : n < 0 ? "rgba(239,68,68,0.3)"  : "rgba(0,0,0,0.15)";
  return (
    <span
      title="Current stock availability"
      style={{
        display: "inline-block",
        background: bg, color, border: `1px solid ${border}`,
        borderRadius: 6, padding: "2px 9px",
        fontSize: "0.78rem", fontWeight: 800, whiteSpace: "nowrap",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {n} avail.
    </span>
  );
}

// ── Read-only detail field ───────────────────────────────────────────────────

export function DetailField({ label, children, fullWidth = false }) {
  return (
    <div style={fullWidth ? { gridColumn: "1 / -1" } : {}}>
      <div style={{
        fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.07em",
        textTransform: "uppercase", color: "var(--a-text-faint)",
        marginBottom: 5,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: "0.9rem", color: "var(--a-text)",
        fontWeight: 500, lineHeight: 1.55,
        wordBreak: "break-word",
      }}>
        {children ?? <span style={{ color: "var(--a-text-faint)" }}>—</span>}
      </div>
    </div>
  );
}
