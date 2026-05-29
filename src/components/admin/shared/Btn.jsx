/**
 * Btn.jsx — shared button component for all admin tabs.
 *
 * Props:
 *   variant   — "primary" | "danger" | "ghost" | "default" | "teal" | "back"
 *   small     — reduces font size and padding
 *   title     — tooltip text
 *   disabled  — greys out and blocks click
 *   icon      — emoji/symbol shown at mobile widths instead of label text
 *               e.g. icon="✏️"  renders: <span class="btn-icon">✏️</span>
 *                                        <span class="btn-label">Edit</span>
 *               CSS hides .btn-label and shows .btn-icon at ≤768 px.
 *               If icon is omitted the button text is always visible.
 */
export default function Btn({ onClick, variant = "default", children, disabled, small, title, icon }) {
  const classMap = {
    primary: "act-btn act-save",
    danger:  "act-btn act-delete",
    ghost:   "act-btn act-cancel",
    default: "act-btn act-edit",
    back:    "act-back-btn",
    teal:    "activity-add-btn",
  };

  const sizeOverride = small ? { fontSize: "0.75rem", padding: "3px 10px" } : {};

  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={classMap[variant] ?? "act-btn"}
      style={{
        cursor:  disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        ...sizeOverride,
      }}
    >
      {icon ? (
        <>
          {/* Shown only on mobile (≤768 px) via CSS */}
          <span className="btn-icon" aria-hidden="true">{icon}</span>
          {/* Hidden on mobile, visible on desktop */}
          <span className="btn-label">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
