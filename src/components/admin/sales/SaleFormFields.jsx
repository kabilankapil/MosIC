// src/components/admin/sales/SaleFormFields.jsx
//
// Renders the add/edit form for a sale header record.
// Extracted from Sales.jsx — mirrors Purchase's PurchaseFormFields pattern.
//
// Props:
//   form            — current sale form state
//   setForm         — setState setter (field, value) via handleFormChange
//   errs            — validation error map { date, validity, fromParty, … }
//   customers       — full customer list (from ["customers"] query)
//   files           — full files list   (from ["files"] query)
//   contacts        — contacts for the selected To Party
//   loadingContacts — boolean
//   onFieldChange   — async (field: string, value: string) => void
//                     handles fromParty/toParty side-effects (contact fetch, reset)

import DatePicker from "../DatePicker";
import { Field } from "./salesHelpers";
import {
  DOCTYPE_OPTIONS, STATUS_OPTIONS, CURRENCIES,
} from "./salesConstants";

export default function SaleFormFields({
  form, onFieldChange,
  errs = {},
  customers = [], files = [],
  contacts = [], loadingContacts = false,
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>

      {/* ── Sales Date ── */}
      <Field label="Sales Date" required error={errs.date}>
        <DatePicker
          value={form.date}
          onChange={(date) => onFieldChange("date", date)}
        />
      </Field>

      {/* ── Validity Date ── */}
      <Field label="Validity Date" required error={errs.validity}>
        <DatePicker
          value={form.validity}
          onChange={(date) => onFieldChange("validity", date)}
        />
      </Field>

      {/* ── From Party ── */}
      <Field label="From Party" required error={errs.fromParty}>
        <select
          className="activity-input"
          value={form.fromParty}
          onChange={(e) => onFieldChange("fromParty", e.target.value)}
        >
          <option value="">— Select —</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.companyName}</option>
          ))}
        </select>
      </Field>

      {/* ── To Party (filters out From Party) ── */}
      <Field label="To Party" required error={errs.toParty}>
        <select
          className="activity-input"
          value={form.toParty}
          onChange={(e) => onFieldChange("toParty", e.target.value)}
        >
          <option value="">— Select —</option>
          {customers
            .filter((c) => String(c.id) !== String(form.fromParty))
            .map((c) => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
        </select>
      </Field>

      {/* ── Enquiry Date ── */}
      <Field label="Enquiry Date" required error={errs.enquiryDate}>
        <DatePicker
          value={form.enquiryDate}
          onChange={(date) => onFieldChange("enquiryDate", date)}
        />
      </Field>

      {/* ── Delivery Terms ── */}
      <Field label="Delivery Terms" required error={errs.deliveryTerms}>
        <input
          className="activity-input"
          placeholder="e.g. FOB, CIF, Ex-Works"
          value={form.deliveryTerms}
          onChange={(e) => onFieldChange("deliveryTerms", e.target.value)}
        />
      </Field>

      {/* ── Payment Terms ── */}
      <Field label="Payment Terms" required error={errs.paymentTerms}>
        <input
          className="activity-input"
          placeholder="e.g. Net 30, Advance"
          value={form.paymentTerms}
          onChange={(e) => onFieldChange("paymentTerms", e.target.value)}
        />
      </Field>

      {/* ── Currency ── */}
      <Field label="Currency" required error={errs.currency}>
        <select
          className="activity-input"
          value={form.currency}
          onChange={(e) => onFieldChange("currency", e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </Field>

      {/* ── Document Type ── */}
      <Field label="Document Type" required error={errs.documentType}>
        <select
          className="activity-input"
          value={form.documentType}
          onChange={(e) => onFieldChange("documentType", e.target.value)}
        >
          {DOCTYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>

      {/* ── Transaction Type ── */}
      <Field label="Transaction Type" required error={errs.transactionType}>
        <input
          className="activity-input"
          placeholder="e.g. SALES, EXPORT"
          value={form.transactionType}
          onChange={(e) => onFieldChange("transactionType", e.target.value)}
        />
      </Field>

      {/* ── Addressed To (depends on To Party) ── */}
      <Field label="Addressed To" required error={errs.addressedTo}>
        <select
          className="activity-input"
          style={{
            opacity: form.toParty ? 1 : 0.5,
            cursor:  form.toParty ? "pointer" : "not-allowed",
          }}
          value={form.addressedTo}
          disabled={!form.toParty}
          onChange={(e) => onFieldChange("addressedTo", e.target.value)}
        >
          <option value="">
            {!form.toParty
              ? "— Select To Party first —"
              : loadingContacts
                ? "Loading contacts…"
                : contacts.length === 0
                  ? "— No contacts found —"
                  : "— Select PoC —"}
          </option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.phone ? ` (${c.phone})` : ""}
            </option>
          ))}
        </select>
      </Field>

      {/* ── File Reference ── */}
      <Field label="File Reference" required error={errs.fileReference}>
        <select
          className="activity-input"
          value={form.fileReference}
          onChange={(e) => onFieldChange("fileReference", e.target.value)}
        >
          <option value="">— Select File —</option>
          {files.map((f) => (
            <option key={f.fileId} value={f.fileId}>
              {f.fileId} – {f.activity} – {f.subject || "—"}
            </option>
          ))}
        </select>
      </Field>

      {/* ── Status ── */}
      <Field label="Status" required error={errs.status}>
        <select
          className="activity-input"
          value={form.status}
          onChange={(e) => onFieldChange("status", e.target.value)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>

      {/* ── Description (full width) ── */}
      <Field label="Description" required span2 error={errs.description}>
        <textarea
          className="activity-input activity-textarea"
          rows={3}
          style={{ resize: "vertical" }}
          placeholder="Description is required…"
          value={form.description}
          onChange={(e) => onFieldChange("description", e.target.value)}
        />
      </Field>

    </div>
  );
}
