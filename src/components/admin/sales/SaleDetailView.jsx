// src/components/admin/sales/SaleDetailView.jsx
//
// Read-only detail card for a single sale record.
// Mirrors PurchaseDetailView — same layout, same helper components,
// adapted for sale field names (date, fromParty, documentType, etc.)
//
// Props:
//   sale          — sale object
//   onBack        — () => void
//   onEdit        — () => void
//   onOpenItems   — () => void
//   canEdit       — bool
//   customerName  — (id) => string
//   fileRefLabel  — (ref) => string

import { fmtDate } from "../shared/adminStyles";
import { SectionCard, InfoCard, DetailRow, DocBadge } from "./salesHelpers";

export default function SaleDetailView({
  sale, onBack, onEdit, onOpenItems, canEdit, customerName, fileRefLabel,
}) {
  return (
    <div style={{ padding: 24 }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button className="act-back-btn" onClick={onBack}>← Sales</button>
        <span style={{ color: "var(--a-text-faint)" }}>/</span>
        <span style={{ color: "var(--a-text-muted)", fontSize: "0.9rem" }}>
          {sale.documentType}
        </span>
        <span style={{ color: "var(--a-text-faint)" }}>/</span>
        <span style={{ color: "var(--a-teal)", fontWeight: 600, fontSize: "0.9rem" }}>
          {customerName(sale.fromParty)} → {customerName(sale.toParty)}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="act-btn act-save" onClick={onOpenItems}>📋 Line Items</button>
          {canEdit && <button className="act-btn act-edit" onClick={onEdit}>✏️ Edit</button>}
        </div>
      </div>

      {/* ── Header card ── */}
      <div style={{
        background: "var(--a-teal-05)", border: "1px solid var(--a-teal-20)",
        borderRadius: 10, padding: "18px 22px",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        marginBottom: 16,
      }}>
        <div>
          <p style={{
            margin: "0 0 6px", fontSize: "0.68rem", fontWeight: 800,
            letterSpacing: "0.08em", color: "var(--a-text-faint)", textTransform: "uppercase",
          }}>
            Sale Detail
          </p>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.6rem", fontWeight: 800, color: "var(--a-text)" }}>
            <DocBadge type={sale.documentType} />
          </h2>
          <span style={{ fontSize: "0.78rem", color: "var(--a-text-muted)" }}>
            {sale.transactionType || "—"}
          </span>
        </div>
        <span style={{
          background: "var(--a-teal-10)", color: "var(--a-teal)", padding: "7px 16px",
          borderRadius: 20, fontSize: "0.85rem", fontWeight: 700,
          border: "1px solid var(--a-teal-30)", whiteSpace: "nowrap",
        }}>
          #{sale.id}
        </span>
      </div>

      {/* ── Date cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <InfoCard label="Sales Date"    value={fmtDate(sale.date)}     icon="📅" />
        <InfoCard label="Validity Date" value={fmtDate(sale.validity)} icon="⏳" />
      </div>

      {/* ── Party cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <InfoCard label="From Party" value={customerName(sale.fromParty)} teal />
        <InfoCard label="To Party"   value={customerName(sale.toParty)}   teal />
      </div>

      {/* ── Document details ── */}
      <SectionCard title="Document Details">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px 24px" }}>
          <DetailRow label="Currency"       value={sale.currency} />
          <DetailRow label="Payment Terms"  value={sale.paymentTerms} />
          <DetailRow label="Delivery Terms" value={sale.deliveryTerms} />
          <DetailRow label="Enquiry Date"   value={fmtDate(sale.enquiryDate)} />
          <DetailRow label="Addressed To"   value={sale.addressedTo} />
          <DetailRow label="File Reference" value={fileRefLabel(sale.fileReference)} />
          <DetailRow label="Status"         value={sale.status} teal />
        </div>
      </SectionCard>

      {/* ── Description ── */}
      <SectionCard title="Description" noMargin>
        <p style={{
          margin: 0, fontSize: "0.875rem", lineHeight: 1.7, whiteSpace: "pre-wrap",
          color: sale.description ? "var(--a-text-body)" : "var(--a-text-faint)",
          fontStyle: sale.description ? "normal" : "italic",
        }}>
          {sale.description || "No description provided."}
        </p>
      </SectionCard>

      <div style={{ marginTop: 20 }}>
        <button className="activity-add-btn" onClick={onOpenItems}>📋 View Line Items</button>
      </div>

    </div>
  );
}
