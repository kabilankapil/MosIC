/**
 * StatusDot.jsx — shared status indicator for all admin tabs.
 * Shows a coloured dot + label for active / closed / other statuses.
 */
export default function StatusDot({ status }) {
  const s       = (status || "").toLowerCase();
  const active  = s === "active";
  const closed  = s === "closed";
  const dotColor = active ? "#22c55e" : closed ? "#ef4444" : "var(--a-text-faint)";
  const txtColor = active ? "#22c55e" : closed ? "#ef4444" : "var(--a-text-muted)";

  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
        background: dotColor, display: "inline-block",
      }} />
      <span style={{ color: txtColor, fontSize: "0.82rem" }}>
        {status || "—"}
      </span>
    </span>
  );
}