// src/components/admin/purchase/ItemFormFields.jsx
//
// Renders the add/edit form for a single purchase line item.
// Props:
//   form     — current item form state
//   onChange — (fieldName, value) => void  (caller handles calcLine)
//   errs     — validation error map

import React from "react";
import { fmt, labelStyle, inputStyle } from "../shared/adminStyles";
import { ITEM_STATUS_OPTIONS, errStyle } from "./purchaseConstants";

const roInput = { background: "var(--a-teal-05)", color: "var(--a-text-muted)" };

export default function ItemFormFields({ form, onChange, errs = {} }) {
  const err = (key) => errs[key] && <span style={errStyle}>{errs[key]}</span>;
  const errBorder = (key) =>
    errs[key] ? { border: "1px solid var(--a-danger, #ef4444)" } : {};

  return (
    <div>
      {/* ── Product / HSN ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px 16px", marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Product / Service *</label>
          <input
            className="activity-input"
            style={{ ...inputStyle, ...errBorder("nameOfProductService") }}
            placeholder="e.g. Steel Pipes"
            value={form.nameOfProductService}
            onChange={(e) => onChange("nameOfProductService", e.target.value)}
          />
          {err("nameOfProductService")}
        </div>
        <div>
          <label style={labelStyle}>HSN / ACS</label>
          <input
            className="activity-input"
            style={{ ...inputStyle, ...errBorder("hsnAcs") }}
            placeholder="e.g. 7304"
            value={form.hsnAcs}
            onChange={(e) => onChange("hsnAcs", e.target.value)}
          />
          {err("hsnAcs")}
        </div>
      </div>

      {/* ── Qty / Unit / Rate / Taxable ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px 16px", marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Quantity *</label>
          <input
            type="number" min="0"
            className="activity-input"
            style={{ ...inputStyle, ...errBorder("quantity") }}
            placeholder="0"
            value={form.quantity}
            onChange={(e) => onChange("quantity", e.target.value)}
          />
          {err("quantity")}
        </div>
        <div>
          <label style={labelStyle}>Unit</label>
          <input
            className="activity-input"
            style={inputStyle}
            placeholder="e.g. PCS, KG"
            value={form.unit}
            onChange={(e) => onChange("unit", e.target.value)}
          />
        </div>
        <div>
          <label style={labelStyle}>Unit Rate *</label>
          <input
            type="number" min="0"
            className="activity-input"
            style={{ ...inputStyle, ...errBorder("unitRate") }}
            placeholder="0.00"
            value={form.unitRate}
            onChange={(e) => onChange("unitRate", e.target.value)}
          />
          {err("unitRate")}
        </div>
        <div>
          <label style={labelStyle}>Taxable Value (auto)</label>
          <input
            readOnly
            className="activity-input"
            style={{ ...inputStyle, ...roInput }}
            value={fmt(form.taxableValue)}
          />
        </div>
      </div>

      {/* ── Tax details ── */}
      <div style={{
        border: "1px solid var(--a-teal-20)", borderRadius: 8,
        padding: "12px 16px", marginBottom: 12,
        background: "var(--a-teal-05)",
      }}>
        <p style={{ margin: "0 0 10px", fontSize: "0.72rem", fontWeight: 700,
          letterSpacing: "0.08em", color: "var(--a-teal)" }}>TAX DETAILS</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px 16px" }}>
          {[
            ["CGST", "cgstRate", "cgstAmount"],
            ["SGST", "sgstRate", "sgstAmount"],
            ["IGST", "igstRate", "igstAmount"],
          ].map(([label, rateKey, amtKey]) => (
            <div key={label} style={{ display: "contents" }}>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: "0.72rem", fontWeight: 700,
                  color: "var(--a-teal)", letterSpacing: "0.05em" }}>{label}</p>
                <label style={labelStyle}>Rate %</label>
                <input
                  type="number" min="0"
                  className="activity-input"
                  style={{ ...inputStyle, ...errBorder(rateKey) }}
                  placeholder="0"
                  value={form[rateKey]}
                  onChange={(e) => onChange(rateKey, e.target.value)}
                />
                {err(rateKey)}
              </div>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: "0.72rem", fontWeight: 700,
                  color: "var(--a-teal)", letterSpacing: "0.05em" }}>&nbsp;</p>
                <label style={labelStyle}>Amount (auto)</label>
                <input
                  readOnly
                  className="activity-input"
                  style={{ ...inputStyle, ...roInput, fontWeight: 600 }}
                  value={fmt(form[amtKey])}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Total / Status ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
        <div>
          <label style={labelStyle}>Total (auto)</label>
          <input
            readOnly
            className="activity-input"
            style={{ ...inputStyle, ...roInput, fontWeight: 700 }}
            value={fmt(form.total)}
          />
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select
            className="activity-input"
            style={inputStyle}
            value={form.status}
            onChange={(e) => onChange("status", e.target.value)}
          >
            {ITEM_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
