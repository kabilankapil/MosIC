// src/components/admin/matpass/StockItemsSection.jsx
//
// Multi-row stock items table — used in the add form, edit form, and detail view.
//
// Props:
//   rows         — array of stock row objects
//   setRows      — setState setter (pass a no-op `() => {}` when readOnly)
//   stockItems   — full stock items list (from ["stockItems"] query)
//   allMovements — all stock movements (from ["stocks","all"] query), for availability
//   readOnly     — boolean (default false); hides edit controls and "+ New Item"

import { thStyle, inputStyle } from "../shared/adminStyles";
import { AvailBadge } from "./matpassShared";
import { computeItemBalance, } from "./matpassHelpers";
import { RETURN_OPTIONS, emptyStockRow } from "./matpassConstants";

export default function StockItemsSection({
  rows,
  setRows,
  stockItems,
  allMovements,
  readOnly = false,
}) {
  const activeItems = (stockItems || []).filter(i => Number(i.status) === 1);

  const updateRow = (key, patch) =>
    setRows(prev => prev.map(r => r._key === key ? { ...r, ...patch } : r));

  const removeRow = (key) => {
    setRows(prev => prev.map(r => {
      if (r._key !== key) return r;
      if (r.id) return { ...r, deleted: true };  // existing → soft-delete
      return null;                                 // new → remove completely
    }).filter(Boolean));
  };

  const visibleRows = rows.filter(r => !r.deleted);

  return (
    <div style={{
      marginTop: 20,
      border: "1px solid var(--a-teal-20)",
      borderRadius: 10,
      overflow: "hidden",
    }}>
      {/* Section header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 16px",
        background: "linear-gradient(135deg, var(--a-teal-10), var(--a-teal-05, rgba(20,184,166,0.05)))",
        borderBottom: "1px solid var(--a-teal-20)",
      }}>
        <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--a-teal)" }}>
          📦 Stock Items
        </span>
        {!readOnly && (
          <button
            type="button"
            className="activity-add-btn"
            style={{ fontSize: "0.8rem", padding: "4px 12px" }}
            onClick={() => setRows(prev => [...prev, emptyStockRow()])}
          >
            + New Item
          </button>
        )}
      </div>

      {visibleRows.length === 0 ? (
        <div style={{
          padding: "18px 16px", textAlign: "center",
          color: "var(--a-text-faint)", fontSize: "0.82rem", fontStyle: "italic",
        }}>
          {readOnly
            ? "No stock items linked."
            : 'Click "+ New Item" to attach stock items to this MAT Pass.'}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
            <thead>
              <tr style={{ background: "var(--a-teal-04, rgba(20,184,166,0.04))" }}>
                <th style={{ ...thStyle, minWidth: 160, textAlign: "left", padding: "8px 12px" }}>ITEM</th>
                <th style={{ ...thStyle, width: 100, textAlign: "center" }}>AVAILABILITY</th>
                <th style={{ ...thStyle, width: 90,  textAlign: "center" }}>QTY</th>
                <th style={{ ...thStyle, minWidth: 140, textAlign: "left" }}>REMARKS</th>
                <th style={{ ...thStyle, width: 130 }}>RETURN TYPE</th>
                {!readOnly && <th style={{ ...thStyle, width: 44, textAlign: "center" }}></th>}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                const avail       = row.stockItemId
                  ? computeItemBalance(row.stockItemId, stockItems, allMovements)
                  : null;
                const selectedItem = activeItems.find(i => String(i.id) === String(row.stockItemId));

                return (
                  <tr key={row._key} style={{ borderTop: "1px solid var(--a-teal-10)" }}>
                    {/* Item selector */}
                    <td style={{ padding: "8px 12px" }}>
                      {readOnly ? (
                        <span style={{ fontWeight: 600 }}>
                          {selectedItem?.productName || (row.stockItemId ? `Item #${row.stockItemId}` : "—")}
                        </span>
                      ) : (
                        <select
                          className="activity-input"
                          style={{ ...inputStyle, margin: 0, minWidth: 140 }}
                          value={row.stockItemId}
                          onChange={e => updateRow(row._key, { stockItemId: e.target.value })}
                        >
                          <option value="">— Select —</option>
                          {activeItems.map(i => (
                            <option key={i.id} value={i.id}>
                              {i.productName}{i.smUnit ? ` (${i.smUnit})` : ""}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Availability badge */}
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      {avail !== null
                        ? <AvailBadge value={avail} />
                        : <span style={{ color: "var(--a-text-faint)", fontSize: "0.75rem" }}>—</span>}
                    </td>

                    {/* Quantity */}
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      {readOnly ? (
                        <strong>{row.quantity || "—"}</strong>
                      ) : (
                        <input
                          className="activity-input"
                          style={{ ...inputStyle, margin: 0, width: 72, textAlign: "center" }}
                          type="number" min="0" step="any"
                          placeholder="0"
                          value={row.quantity}
                          onChange={e => updateRow(row._key, { quantity: e.target.value })}
                        />
                      )}
                    </td>

                    {/* Remarks */}
                    <td style={{ padding: "8px 12px" }}>
                      {readOnly ? (
                        <span>{row.remarks || "—"}</span>
                      ) : (
                        <input
                          className="activity-input"
                          style={{ ...inputStyle, margin: 0 }}
                          placeholder="Optional remarks…"
                          value={row.remarks}
                          onChange={e => updateRow(row._key, { remarks: e.target.value })}
                        />
                      )}
                    </td>

                    {/* Return type */}
                    <td style={{ padding: "8px 12px" }}>
                      {readOnly ? (
                        <span style={{ fontSize: "0.78rem" }}>{row.returnType || "—"}</span>
                      ) : (
                        <select
                          className="activity-input"
                          style={{ ...inputStyle, margin: 0 }}
                          value={row.returnType}
                          onChange={e => updateRow(row._key, { returnType: e.target.value })}
                        >
                          {RETURN_OPTIONS.map(o => <option key={o}>{o}</option>)}
                        </select>
                      )}
                    </td>

                    {/* Remove button */}
                    {!readOnly && (
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>
                        <button
                          type="button"
                          title="Remove item"
                          style={{
                            background: "rgba(239,68,68,0.08)", color: "var(--a-danger)",
                            border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6,
                            padding: "3px 8px", cursor: "pointer", fontSize: "0.85rem",
                          }}
                          onClick={() => removeRow(row._key)}
                        >
                          ✕
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
