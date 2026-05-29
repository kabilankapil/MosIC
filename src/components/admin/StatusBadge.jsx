const STATUS_STYLES = {
  ACTIVE: {
    background: "var(--a-teal-15)",
    color: "var(--a-teal)",
    border: "1px solid var(--a-teal-30)",
  },
  CLOSED: {
    background: "var(--a-danger-10, rgba(239,68,68,0.10))",
    color: "var(--a-danger, #ef4444)",
    border: "1px solid var(--a-danger-30, rgba(239,68,68,0.30))",
  },
  // fallback for unknown / legacy values ("1", "OPEN", etc.)
  _unknown: {
    background: "rgba(107,114,128,0.10)",
    color: "#6b7280",
    border: "1px solid rgba(107,114,128,0.30)",
  },
};

export default function StatusBadge({ status }) {
  const key = String(status || "").toUpperCase();
  const style = STATUS_STYLES[key] ?? STATUS_STYLES._unknown;
  const label = STATUS_STYLES[key] ? key : "UNKNOWN";

  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 12,
      fontSize: "0.75rem", fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.05em",
      ...style,
    }}>
      {label}
    </span>
  );
}
