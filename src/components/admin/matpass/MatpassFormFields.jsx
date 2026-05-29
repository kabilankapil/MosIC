// src/components/admin/matpass/MatpassFormFields.jsx
//
// Form fields for add/edit a MAT Pass header record.
// Extracted from the formFields() inner function in the original Matpass.jsx.
// Does NOT include stock items — those are rendered separately via StockItemsSection.
//
// Props:
//   form             — current form state
//   setForm          — setState setter
//   contacts         — contacts for the selected party (loaded by parent)
//   onPartyChange    — async (partyId: string) => void  — triggers contact fetch
//   customers        — full customer list (from ["customers"] query)
//   files            — full files list   (from ["files"] query)
//   loadingContacts  — boolean

import { labelStyle, inputStyle } from "../shared/adminStyles";
import DatePicker from "../DatePicker";
import { resolveFileLabel } from "./matpassHelpers";

export default function MatpassFormFields({
  form,
  setForm,
  contacts,
  onPartyChange,
  customers,
  files,
  loadingContacts,
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 20px" }}>

      {/* Direction */}
      <div>
        <label style={labelStyle}>
          Direction <span style={{ color: "var(--a-danger)" }}>*</span>
        </label>
        <select
          className="activity-input"
          style={inputStyle}
          value={form.inOrOut}
          onChange={e => setForm({ ...form, inOrOut: e.target.value })}
        >
          <option value="IN">IN — stock incoming ＋</option>
          <option value="OUT">OUT — stock outgoing −</option>
        </select>
      </div>

      {/* To Party */}
      <div>
        <label style={labelStyle}>
          To Party <span style={{ color: "var(--a-danger)" }}>*</span>
        </label>
        <select
          className="activity-input"
          style={inputStyle}
          value={form.party}
          onChange={e => onPartyChange(e.target.value)}
        >
          <option value="">— Select Party —</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>
              {c.companyName || c.customerName || c.name || `#${c.id}`}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <DatePicker
          label={<>Date <span style={{ color: "var(--a-danger)" }}>*</span></>}
          required
          value={form.date}
          onChange={date => setForm({ ...form, date })}
        />
      </div>

      {/* Contact Person */}
      <div>
        <label style={labelStyle}>
          Contact Person <span style={{ color: "var(--a-danger)" }}>*</span>
        </label>
        <select
          className="activity-input"
          style={inputStyle}
          value={form.contactPerson}
          disabled={!form.party}
          onChange={e => setForm({ ...form, contactPerson: e.target.value })}
        >
          <option value="">
            {!form.party
              ? "— Select Party first —"
              : loadingContacts
              ? "Loading contacts…"
              : contacts.length === 0
              ? "— No contacts found —"
              : "— Select contact —"}
          </option>
          {contacts.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}{c.phone ? ` (${c.phone})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* File Reference */}
      <div>
        <label style={labelStyle}>
          File Reference <span style={{ color: "var(--a-danger)" }}>*</span>
        </label>
        <select
          className="activity-input"
          style={inputStyle}
          value={form.fileRef}
          onChange={e => setForm({ ...form, fileRef: e.target.value })}
        >
          <option value="">— None —</option>
          {files.map(f => (
            <option key={f.fileId} value={f.fileId}>
              {f.activity ? `${f.activity} — ${f.subject || f.fileId}` : f.fileId}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <label style={labelStyle}>
          Status <span style={{ color: "var(--a-danger)" }}>*</span>
        </label>
        <select
          className="activity-input"
          style={inputStyle}
          value={form.status}
          onChange={e => setForm({ ...form, status: Number(e.target.value) })}
        >
          <option value={1}>Active</option>
          <option value={0}>Closed</option>
        </select>
      </div>

      {/* Description — full width */}
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={labelStyle}>
          Description <span style={{ color: "var(--a-danger)" }}>*</span>
        </label>
        <textarea
          className="activity-input activity-textarea"
          style={{ ...inputStyle, minHeight: 68, resize: "vertical" }}
          placeholder={
            form.fileRef
              ? `e.g. Material ${form.inOrOut} Pass - ${resolveFileLabel(files, form.fileRef)}`
              : "Enter description…"
          }
          value={form.discription}
          onChange={e => setForm({ ...form, discription: e.target.value })}
        />
      </div>

    </div>
  );
}
