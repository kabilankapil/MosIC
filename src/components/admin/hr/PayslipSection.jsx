// src/components/admin/hr/PayslipSection.jsx
//
// Document generation panel (payslip + offer/promotion/hike/termination letters)
// and the payslip history table.
//
// Owns internally: payMonth, payYear, payGenerating, payConfirmKey,
//                  docPanel, hikeInputs, termInputs.
//
// Props:
//   selectedEmployee  — employee object (or null)
//   currentPosition   — current active position (or null)
//   isEmployeeActive  — boolean
//   payslips          — array (managed by HR.jsx via useQuery)
//   payLoading        — boolean
//   onPayslipSaved    — (record) => void  — HR updates its query cache
//   onPayslipDeleted  — (id) => void      — HR updates its query cache
//   role              — string

import { useState } from "react";
import { createPayslip, deletePayslip } from "../../../api/employee";
import { labelStyle, inputStyle, fmt } from "../shared/adminStyles";
import { TableScroller, ConfirmDelete } from "../shared/AdminTable";
import { canDelete } from "../shared/adminStyles";
import { useToast } from "../shared/ToastContext";
import DatePicker from "../DatePicker";
import {
  printPayslip, printPayslipFromRecord,
  printOfferLetter, printPromotionLetter,
  printHikeLetter, printResignationLetter,
} from "../PDFTemplates";
import { MONTHS } from "./hrConstants";
import { thStyle, tdBase, tdNowrap } from "../shared/adminStyles";

export default function PayslipSection({
  selectedEmployee,
  currentPosition,
  isEmployeeActive,
  terminationDate,
  isTerminatedEffective,
  payslips,
  payLoading,
  onPayslipSaved,
  onPayslipDeleted,
  role,
}) {
  const toast = useToast();
  const now   = new Date();

  const [payMonth,      setPayMonth]      = useState(now.getMonth() + 1);
  const [payYear,       setPayYear]       = useState(now.getFullYear());
  const [payGenerating, setPayGenerating] = useState(false);
  const [payConfirmKey, setPayConfirmKey] = useState(null);
  const [docPanel,      setDocPanel]      = useState(null);
  const [hikeInputs,    setHikeInputs]    = useState({ prevCtc: "", newCtc: "" });
  const [termInputs,    setTermInputs]    = useState({ lastDate: "" });

  // ── Payslip generation ────────────────────────────────────────────────────
  const handleGeneratePayslip = async () => {
    if (!selectedEmployee) { toast.error("Select an employee first."); return; }
    if (!currentPosition)  { toast.error("No active position found for this employee."); return; }
    if (isTerminatedEffective) {
      toast.error(`Payslip cannot be generated — employee inactive as of ${terminationDate}.`);
      return;
    }
    if (!isEmployeeActive) {
      toast.error(`Cannot generate payslip — employee is "${selectedEmployee.status}".`);
      return;
    }

    const grossCheck =
      parseFloat(currentPosition.empBasic     || 0) +
      parseFloat(currentPosition.empHra       || 0) +
      parseFloat(currentPosition.empAllowance || 0);
    if (grossCheck === 0) {
      toast.error("Salary is ₹0 — update position with salary details first.");
      return;
    }

    const dup = payslips.find(
      (p) => String(p.empMonth) === String(payMonth) && String(p.empYear) === String(payYear),
    );
    if (dup) {
      toast.error(`Payslip for ${MONTHS[payMonth - 1]} ${payYear} already exists. Delete it first.`);
      return;
    }

    setPayGenerating(true);
    try {
      const payData = {
        empMonth: String(payMonth), empYear: String(payYear),
        basic:       currentPosition.empBasic     || "0",
        hra:         currentPosition.empHra       || "0",
        allowancess: currentPosition.empAllowance || "0",
        tds:         currentPosition.empTds       || "0",
        pt:          currentPosition.empPt        || "0",
        loan:        currentPosition.empLoans     || "0",
      };
      const saved = await createPayslip(selectedEmployee.id, payData);
      onPayslipSaved(saved);
      toast.success?.(`Payslip for ${MONTHS[payMonth - 1]} ${payYear} saved.`);
      printPayslip({
        employee: selectedEmployee,
        position: currentPosition,
        payMonth, payYear, refId: saved.id,
      });
    } catch (e) {
      toast.error(e.message || "Failed to save payslip.");
    } finally {
      setPayGenerating(false);
    }
  };

  const handleDeletePayslip = async (id) => {
    try {
      await deletePayslip(id);
      onPayslipDeleted(id);
    } catch (e) {
      toast.error(e.message || "Failed to delete payslip.");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Document generation ─────────────────────────────────────────── */}
      <div style={{
        background: "var(--a-surface)",
        border: "1px solid var(--a-border-card,rgba(20,184,166,0.2))",
        borderRadius: 14, padding: "18px 24px", marginBottom: 20,
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", color: "var(--a-teal)", marginBottom: 14 }}>
          📄 GENERATE DOCUMENTS
        </div>

        {!currentPosition ? (
          <p style={{ fontSize: "0.82rem", color: "var(--a-text-faint)", fontStyle: "italic" }}>
            Assign a position to this employee before generating documents.
          </p>
        ) : (
          <>
            {/* Payslip controls */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--a-text-faint)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Payslip Month / Year
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <select
                    className="activity-input"
                    style={{ ...inputStyle, marginBottom: 0, width: 120 }}
                    value={payMonth}
                    onChange={(e) => setPayMonth(Number(e.target.value))}
                  >
                    {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                  </select>
                  <input
                    className="activity-input"
                    style={{ ...inputStyle, marginBottom: 0, width: 72 }}
                    type="number" min="2000" max="2100"
                    value={payYear}
                    onChange={(e) => setPayYear(Number(e.target.value))}
                  />
                  <button
                    className="act-btn act-save"
                    style={{ whiteSpace: "nowrap" }}
                    disabled={!isEmployeeActive || isTerminatedEffective || payGenerating}
                    title={
                      isTerminatedEffective
                        ? `Employee inactive as of ${terminationDate} — payslip generation blocked`
                        : !isEmployeeActive
                        ? `Employee is ${selectedEmployee?.status} — blocked`
                        : "Save and download payslip"
                    }
                    onClick={handleGeneratePayslip}
                  >
                    {payGenerating ? "Saving…" : "📄 Generate & Save Payslip"}
                  </button>
                </div>
                {!isEmployeeActive && (
                  <div style={{ fontSize: "0.72rem", color: "#ef4444", marginTop: 5 }}>
                    Blocked — employee is {selectedEmployee?.status}
                  </div>
                )}
              </div>

              <div style={{ width: 1, background: "var(--a-teal-20)", height: 36, alignSelf: "flex-end" }} />
              {/* Termination block message */}
            {isTerminatedEffective && terminationDate && (
              <div style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: "0.82rem",
                color: "#ef4444",
                fontWeight: 600,
                marginBottom: 14,
              }}>
                ⛔ Payslip cannot be generated — employee inactive as of {terminationDate}.
              </div>
            )}

              {/* Letter buttons */}
              <button className="act-btn act-edit" style={{ whiteSpace: "nowrap" }}
                onClick={() => printOfferLetter({ employee: selectedEmployee, position: currentPosition })}>
                📋 Offer Letter
              </button>
              <button className="act-btn act-edit" style={{ whiteSpace: "nowrap" }}
                onClick={() => printPromotionLetter({ employee: selectedEmployee, position: currentPosition })}>
                🏆 Promotion Letter
              </button>
              <button
                className={`act-btn ${docPanel === "hike" ? "act-save" : "act-edit"}`}
                style={{ whiteSpace: "nowrap" }}
                onClick={() => setDocPanel((p) => p === "hike" ? null : "hike")}
              >
                💰 Hike Letter
              </button>
              <button
                className={`act-btn ${docPanel === "resignation" ? "act-delete" : "act-edit"}`}
                style={{ whiteSpace: "nowrap" }}
                onClick={() => setDocPanel((p) => p === "resignation" ? null : "resignation")}
              >
                🚪 Resignation Letter
              </button>
            </div>

            {/* Hike letter sub-panel */}
            {docPanel === "hike" && (
              <div style={{
                ...{
                  background: "var(--a-teal-05,rgba(20,184,166,0.05))",
                  border: "1px solid var(--a-teal-20)", borderRadius: 10,
                  padding: "16px 20px", marginBottom: 12,
                },
                maxWidth: 580,
              }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--a-teal)", marginBottom: 12 }}>
                  💰 SALARY HIKE LETTER — Extra Details
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div>
                    <label style={labelStyle}>Previous Annual CTC (₹)</label>
                    <input className="activity-input" style={{ ...inputStyle, width: 180, marginBottom: 0 }}
                      type="text" inputMode="numeric" placeholder="e.g. 360000"
                      value={hikeInputs.prevCtc}
                      onChange={(e) => setHikeInputs((p) => ({ ...p, prevCtc: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>New Annual CTC (₹)</label>
                    <input className="activity-input" style={{ ...inputStyle, width: 180, marginBottom: 0 }}
                      type="text" inputMode="numeric" placeholder="e.g. 420000"
                      value={hikeInputs.newCtc}
                      onChange={(e) => setHikeInputs((p) => ({ ...p, newCtc: e.target.value }))} />
                  </div>
                  {hikeInputs.prevCtc && hikeInputs.newCtc && (
                    <div style={{ fontSize: "0.8rem", color: "var(--a-text-faint)", paddingBottom: 4 }}>
                      Hike:{" "}
                      <strong style={{ color: "var(--a-teal)" }}>
                        {(((parseFloat(hikeInputs.newCtc) - parseFloat(hikeInputs.prevCtc)) / parseFloat(hikeInputs.prevCtc)) * 100).toFixed(1)}%
                      </strong>
                    </div>
                  )}
                  <button className="act-btn act-save" onClick={() => {
                    printHikeLetter({ employee: selectedEmployee, position: currentPosition, prevAnnualCtc: hikeInputs.prevCtc, newAnnualCtc: hikeInputs.newCtc });
                    setDocPanel(null);
                  }}>📄 Generate</button>
                  <button className="act-btn act-cancel" onClick={() => setDocPanel(null)}>Cancel</button>
                </div>
              </div>
            )}

            {/* Resignation letter sub-panel */}
            {docPanel === "resignation" && (
              <div style={{
                background: "rgba(239,68,68,0.04)",
                border: "2px solid rgba(239,68,68,0.3)", borderRadius: 10,
                padding: "16px 20px", marginBottom: 12, maxWidth: 600,
              }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ef4444", marginBottom: 12 }}>
                  🚪 RESIGNATION LETTER — Extra Details
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div>
                    <label style={labelStyle}>Last Working Day</label>
                    <DatePicker label="" value={termInputs.lastDate}
                      onChange={(v) => setTermInputs((p) => ({ ...p, lastDate: v }))} />
                  </div>
                  
                  <button className="act-btn act-delete" onClick={() => {
                     if (!termInputs.lastDate) { toast.error("Last Working Day is required."); return; }
  printResignationLetter({ employee: selectedEmployee, position: currentPosition, lastWorkingDate: termInputs.lastDate });
  setDocPanel(null);
                  }}>📄 Generate</button>
                  <button className="act-btn act-cancel" onClick={() => setDocPanel(null)}>Cancel</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Payslip history table ────────────────────────────────────────── */}
      <div style={{
        background: "var(--a-surface)",
        border: "1px solid var(--a-border-card,rgba(20,184,166,0.2))",
        borderRadius: 14, overflow: "hidden", marginBottom: 20,
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      }}>
        <div style={{
          background: "linear-gradient(135deg,var(--a-teal-15,rgba(20,184,166,0.15)),var(--a-teal-08,rgba(20,184,166,0.08)))",
          borderBottom: "1px solid var(--a-border-card,rgba(20,184,166,0.2))",
          padding: "12px 22px", display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--a-teal)" }}>🗂 Payslip History</span>
          {payLoading
            ? <span style={{ fontSize: "0.75rem", color: "var(--a-text-faint)" }}>Loading…</span>
            : <span style={{ fontSize: "0.75rem", color: "var(--a-text-faint)" }}>{payslips.length} record{payslips.length !== 1 ? "s" : ""}</span>
          }
        </div>
        <TableScroller>
          <table style={{ width: "100%", minWidth: 640, tableLayout: "auto", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 50 }}>ID</th>
                <th style={{ ...thStyle, minWidth: 100 }}>MONTH</th>
                <th style={{ ...thStyle, minWidth: 60 }}>YEAR</th>
                <th style={{ ...thStyle, minWidth: 110 }}>GROSS (₹)</th>
                <th style={{ ...thStyle, minWidth: 110 }}>DEDUCTIONS (₹)</th>
                <th style={{ ...thStyle, minWidth: 110 }}>NET SALARY (₹)</th>
                <th style={{ ...thStyle, width: 120, textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {payslips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="activity-empty">
                    {payLoading ? "Loading…" : 'No payslips found. Use "Generate & Save Payslip" above.'}
                  </td>
                </tr>
              ) : payslips.map((ps, idx) => {
                const gross = parseFloat(ps.totalGross     || 0);
                const ded   = parseFloat(ps.totalDeduction || 0);
                const net   = gross - ded;
                const mName = MONTHS[Number(ps.empMonth) - 1] || ps.empMonth;
                return (
                  <tr
                    key={ps.id}
                    style={{
                      background: idx % 2 === 0 ? "transparent" : "var(--a-teal-04,rgba(20,184,166,0.04))",
                      transition: "background 0.12s",
                    }}
                  >
                    <td style={tdNowrap}>{ps.id}</td>
                    <td style={{ ...tdBase, fontWeight: 600 }}>{mName}</td>
                    <td style={tdNowrap}>{ps.empYear}</td>
                    <td style={{ ...tdBase, color: "var(--a-teal)", fontWeight: 600 }}>{fmt(gross)}</td>
                    <td style={{ ...tdBase, color: "#ef4444" }}>{fmt(ded)}</td>
                    <td style={{ ...tdBase, fontWeight: 700 }}>{fmt(net)}</td>
                    <td style={{ ...tdBase, textAlign: "center", whiteSpace: "nowrap" }}>
                      <button
                        title="Download payslip" className="act-btn act-edit" style={{ marginRight: 4 }}
                        onClick={() => printPayslipFromRecord({ employee: selectedEmployee, currentPosition, record: ps })}
                      >📄</button>
                      {canDelete(role) && (
                        payConfirmKey === `pay-${ps.id}` ? (
                          <ConfirmDelete
                            onConfirm={() => { setPayConfirmKey(null); handleDeletePayslip(ps.id); }}
                            onCancel={() => setPayConfirmKey(null)}
                          />
                        ) : (
                          <button title="Delete payslip" className="act-btn act-delete"
                            onClick={() => setPayConfirmKey(`pay-${ps.id}`)}>🗑️</button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableScroller>
      </div>
    </>
  );
}
