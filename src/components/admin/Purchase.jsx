// src/components/admin/Purchase.jsx
//
// Purchase management: list view, add/edit form, detail view, line items view.
// Owns ["purchases"], ["customers"], ["files"] React Query keys.
//
// Sub-components (./purchase/):
//   PurchaseDetailView — read-only detail card  (NEW — mirrors SaleDetailView)
//   PurchaseFormFields — extracted add/edit form fields
//   PurchaseItems      — line items table + form
//
// Constants / helpers / validation (./purchase/):
//   purchaseConstants  — DOCTYPE_OPTIONS, STATUS_OPTIONS, CURRENCIES, emptyPurchaseForm
//   purchaseHelpers    — DocBadge, ErrMsg, Field, DetailRow, InfoCard, SectionCard
//   purchaseValidation — validatePurchaseForm, validateItemForm (pure, no side-effects)

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllPurchases, createPurchase, updatePurchase, deletePurchase,
} from "../../api/purchases";
import { getCustomers, getContacts } from "../../api/party";
import { getFiles } from "../../api/files";
import { createActivity } from "../../api/fileActivity";
import {
  PAGE_SIZE, fmtDate, iconBtn, editCardStyle,
  thStyle, tdBase, tdNowrap,
  canEdit as canEditRole, canDelete as canDeleteRole, canAdd as canAddRole,
} from "./shared/adminStyles";
import { TableScroller, Pagination, ConfirmDelete } from "./shared/AdminTable";
import { useToast } from "./shared/ToastContext";
import Btn from "./shared/Btn";
import StatusDot from "./shared/StatusDot";

import {
  doctypeLabel, statusLabel, emptyPurchaseForm,
} from "./purchase/purchaseConstants";
import { ErrMsg } from "./purchase/purchaseHelpers";
import { validatePurchaseForm } from "./purchase/purchaseValidation";
import PurchaseDetailView from "./purchase/PurchaseDetailView";
import PurchaseFormFields from "./purchase/PurchaseFormFields";
import PurchaseItems      from "./purchase/PurchaseItems";

export default function Purchase({ role }) {
  const toast = useToast();
  const queryClient = useQueryClient();

  // ── Permissions ──────────────────────────────────────────────
  // Use shared helpers — consistent with Sales, avoids inline role checks.
  const canEdit   = canEditRole(role);
  const canDelete = canDeleteRole(role);
  const canAdd    = canAddRole(role);

  // ── View router ──────────────────────────────────────────────
  // Single string replaces three conflicting booleans:
  //   showAdd, editingId, selectedPurchase — could all be truthy at once.
  // Now: "list" | "form" | "detail" | "items" — only one state drives the view.
  const [view, setView]               = useState("list");
  const [viewPurchase, setViewPurchase] = useState(null); // for "detail"
  const [liPurchase, setLiPurchase]   = useState(null);  // for "items"

  // ── List state ───────────────────────────────────────────────
  const [page, setPage]             = useState(1);
  const [confirmKey, setConfirmKey] = useState(null);

  // ── Form state ───────────────────────────────────────────────
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [form, setForm]                       = useState(emptyPurchaseForm());
  const [formErr, setFormErr]                 = useState("");
  const [formErrs, setFormErrs]               = useState({});
  const [saving, setSaving]                   = useState(false);
  const [toPartyContacts, setToPartyContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // ── Queries ──────────────────────────────────────────────────
  const { data: purchases = [], isLoading: loading, refetch: refetchPurchases } = useQuery({
    queryKey: ["purchases"],
    queryFn:  getAllPurchases,
    select:   (data) => [...data].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)),
  });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });
  const { data: files = [] }     = useQuery({ queryKey: ["files"],     queryFn: getFiles });

  // ── Derived label helpers ────────────────────────────────────
  const customerName = (id) => {
    if (!id) return "—";
    const c = customers.find((c) => String(c.id) === String(id));
    return c ? `${c.id} – ${c.companyName}` : String(id);
  };
  const fileRefLabel = (ref) => {
    if (!ref) return "—";
    const f = files.find((f) => String(f.fileId) === String(ref));
    return f ? `${f.fileId} – ${f.activity}` : String(ref);
  };

  // ── Navigation ───────────────────────────────────────────────
  const openDetail  = (purchase) => { setViewPurchase(purchase); setView("detail"); };
  const openItems   = (purchase) => { setLiPurchase(purchase);   setView("items");  };

  // ── Form open ────────────────────────────────────────────────
  const openForm = async (purchase = null) => {
    setEditingPurchase(purchase);
    setForm(purchase ? { ...emptyPurchaseForm(), ...purchase } : emptyPurchaseForm());
    setToPartyContacts([]);
    setFormErrs({});
    setView("form");
    if (purchase?.purchaseToParty) {
      setLoadingContacts(true);
      try { setToPartyContacts(await getContacts(purchase.purchaseToParty)); }
      catch { setToPartyContacts([]); }
      finally { setLoadingContacts(false); }
    }
  };

  // ── Form field change ────────────────────────────────────────
  // Handles toParty side-effects (contact fetch, addressedTo reset).
  // Passed as `onToPartyChange` to PurchaseFormFields.
  const handleToPartyChange = async (customerId) => {
    setForm((prev) => ({ ...prev, purchaseToParty: customerId, purchaseAddressedTo: "" }));
    if (formErrs.purchaseToParty)
      setFormErrs((prev) => ({ ...prev, purchaseToParty: "" }));
    setToPartyContacts([]);
    if (customerId) {
      setLoadingContacts(true);
      try { setToPartyContacts(await getContacts(customerId)); }
      catch { setToPartyContacts([]); }
      finally { setLoadingContacts(false); }
    }
  };

  const handleFieldChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (formErrs[field]) setFormErrs((prev) => ({ ...prev, [field]: "" }));
  };

  // ── Save purchase ────────────────────────────────────────────
  const savePurchase = async () => {
    const { errs, valid } = validatePurchaseForm(form);
    setFormErrs(errs);
    if (!valid) {
      const firstErr = Object.values(errs).find(Boolean);
      setFormErr(firstErr || "Please fill in all required fields.");
      toast.error(firstErr || "Please fill in all required fields.");
      return;
    }
    setFormErr(""); setFormErrs({});
    setSaving(true);
    try {
      const payload = {
        ...form,
        purchaseStatus:  Number(form.purchaseStatus  ?? 1),
        purchaseDoctype: String(form.purchaseDoctype ?? "3"),
      };

      let saved;
      if (editingPurchase) {
        saved = await updatePurchase(editingPurchase.id, payload);
        queryClient.setQueryData(["purchases"], (prev = []) =>
          prev.map((p) => p.id === saved.id ? saved : p)
            .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
        );
      } else {
        saved = await createPurchase(payload);
        queryClient.setQueryData(["purchases"], (prev = []) =>
          [...prev, saved].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
        );
      }

      // Auto-log activity on the referenced file (fire-and-forget)
      if (form.purchaseFileRef) {
        const isNew    = !editingPurchase;
        const from     = customerName(form.purchaseFromParty);
        const to       = customerName(form.purchaseToParty);
        const docLabel = doctypeLabel(form.purchaseDoctype);
        const today    = new Date().toISOString().slice(0, 10);
        createActivity(form.purchaseFileRef, {
          fileId:      form.purchaseFileRef,
          title:       `${docLabel} ${isNew ? "Created" : "Updated"}`,
          refId:       `P-${saved.id}`,
          date:        today,
          description: `Purchase ${docLabel} ${isNew ? "created" : "updated"} — From: ${from} → To: ${to}${form.purchaseDescription ? ` | ${form.purchaseDescription}` : ""}`,
          status:      "ACTIVE",
        })
          .then(() => queryClient.invalidateQueries({ queryKey: ["files"] }))
          .catch((err) => {
            console.error("[Auto-activity] Purchase failed:", err);
            toast.error(`Activity log failed: ${err.message}`);
          });
      }

      setView("list");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete purchase ──────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await deletePurchase(id);
      queryClient.setQueryData(["purchases"], (prev = []) =>
        prev.filter((p) => p.id !== id)
      );
    } catch (e) {
      toast.error(e.message);
    }
  };

  // ── Paging ───────────────────────────────────────────────────
  const paged = purchases.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ════════════════════════════════════════════════════════════
  // Views
  // ════════════════════════════════════════════════════════════

  // ── Form view ────────────────────────────────────────────────
  if (view === "form") {
    return (
      <div style={{ padding: 24 }}>
        <button className="act-back-btn" onClick={() => setView("list")}>← Back to Purchases</button>

        <div style={{ marginTop: 18, ...editCardStyle, padding: "24px 28px", maxWidth: 860 }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--a-teal)" }}>
              {editingPurchase ? `Edit Purchase #${editingPurchase.id}` : "Add Purchase Record"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--a-text-muted)" }}>
              All fields marked * are required.
            </p>
          </div>

          <PurchaseFormFields
            form={form}
            setForm={setForm}
            contacts={toPartyContacts}
            loadingContacts={loadingContacts}
            onToPartyChange={handleToPartyChange}
            errs={formErrs}
            customers={customers}
            files={files}
          />

          <ErrMsg msg={formErr} />

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Btn variant="primary" onClick={savePurchase} disabled={saving}>
              {saving ? "Saving…" : editingPurchase ? "Update Record" : "Add Record"}
            </Btn>
            <Btn variant="ghost" onClick={() => setView("list")}>Cancel</Btn>
          </div>
        </div>
      </div>
    );
  }

  // ── Detail view ──────────────────────────────────────────────
  if (view === "detail" && viewPurchase) {
    return (
      <PurchaseDetailView
        purchase={viewPurchase}
        onBack={() => { setView("list"); setViewPurchase(null); }}
        onEdit={() => { openForm(viewPurchase); setViewPurchase(null); }}
        onOpenItems={() => openItems(viewPurchase)}
        canEdit={canEdit}
        customerName={customerName}
        fileRefLabel={fileRefLabel}
        doctypeLabel={doctypeLabel}
        statusLabel={statusLabel}
      />
    );
  }

  // ── Line items view ──────────────────────────────────────────
  if (view === "items" && liPurchase) {
    return (
      <PurchaseItems
        purchase={liPurchase}
        role={role}
        customers={customers}
        customerName={customerName}
        onBack={() => { setView("list"); setLiPurchase(null); }}
        onEdit={() => { openForm(liPurchase); setLiPurchase(null); }}
        canEdit={canEdit}
      />
    );
  }

  // ── List view ────────────────────────────────────────────────
  return (
    <div className="content-section">
      <div className="activity-header">
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--a-teal)", margin: 0 }}>
            Purchases
          </h1>
          <p style={{ margin: "3px 0 0", fontSize: "0.74rem", color: "var(--a-text-muted)" }}>
            Manage Enquiries, Quotations, Orders, Invoices and Payments
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <button className="act-btn act-cancel" onClick={refetchPurchases}>Refresh</button>
          {canAdd && (
            <button className="activity-add-btn" onClick={() => openForm()}>+ Add Purchase</button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="loading">Loading…</p>
      ) : (
        <>
          <TableScroller>
            <table style={{ width: "100%", minWidth: 900, tableLayout: "auto", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 44 }}>ID</th>
                  <th style={{ ...thStyle, width: 110 }}>DATE</th>
                  <th style={{ ...thStyle, minWidth: 150 }}>FROM PARTY</th>
                  <th style={{ ...thStyle, minWidth: 120 }}>TO PARTY</th>
                  <th style={{ ...thStyle, width: 120 }}>DOC TYPE</th>
                  <th style={{ ...thStyle, width: 80 }}>CURRENCY</th>
                  <th style={{ ...thStyle, width: 160 }}>FILE REF</th>
                  <th style={{ ...thStyle, width: 100 }}>TX TYPE</th>
                  <th style={{ ...thStyle, width: 90 }}>STATUS</th>
                  <th style={{ ...thStyle, width: 80, textAlign: "center" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="activity-empty">
                      {canAdd
                        ? "No purchases found. Click \"+ Add Purchase\" to create one."
                        : "No purchases found."}
                    </td>
                  </tr>
                ) : paged.map((row, idx) => (
                  <tr
                    key={row.id}
                    style={{
                      cursor: "pointer",
                      background: idx % 2 === 0 ? "transparent" : "var(--a-teal-04, rgba(20,184,166,0.04))",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--a-teal-10)"; }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        idx % 2 === 0 ? "transparent" : "var(--a-teal-04, rgba(20,184,166,0.04))";
                    }}
                    onClick={() => openDetail(row)}
                  >
                    <td style={{ ...tdNowrap, color: "var(--a-teal)", fontWeight: 700 }}>{row.id}</td>
                    <td style={tdNowrap}>{fmtDate(row.purchaseDate)}</td>
                    <td style={{ ...tdBase, fontWeight: 600, color: "var(--a-teal)" }}>
                      {customerName(row.purchaseFromParty)}
                    </td>
                    <td style={tdBase}>{customerName(row.purchaseToParty)}</td>
                    <td style={tdNowrap}>{doctypeLabel(row.purchaseDoctype)}</td>
                    <td style={tdNowrap}>{row.purchaseCurrency || "—"}</td>
                    <td style={{ ...tdNowrap, fontWeight: 700 }}>{fileRefLabel(row.purchaseFileRef)}</td>
                    <td style={tdNowrap}>{row.purchaseTxType || "—"}</td>
                    <td style={tdBase}>
                      <StatusDot status={statusLabel(row.purchaseStatus)} />
                    </td>
                    <td style={{ ...tdBase, textAlign: "center", whiteSpace: "nowrap" }}
                      onClick={(e) => e.stopPropagation()}>
                      <button
                        title="Line Items"
                        style={iconBtn("var(--a-teal)", "var(--a-teal-05)", "var(--a-teal-20)")}
                        onClick={() => openItems(row)}>📋</button>
                      {canEdit && (
                        <button
                          title="Edit"
                          style={iconBtn("var(--a-indigo,#6366f1)", "var(--a-indigo-10,rgba(99,102,241,0.1))", "var(--a-indigo-30,rgba(99,102,241,0.3))")}
                          onClick={() => openForm(row)}>✏️</button>
                      )}
                      {canDelete && (
                        confirmKey === `purchase-${row.id}` ? (
                          <ConfirmDelete
                            onConfirm={() => { setConfirmKey(null); handleDelete(row.id); }}
                            onCancel={() => setConfirmKey(null)}
                          />
                        ) : (
                          <button
                            title="Delete"
                            style={iconBtn("var(--a-danger,#ef4444)", "var(--a-danger-10,rgba(239,68,68,0.1))", "var(--a-danger-30,rgba(239,68,68,0.3))")}
                            onClick={() => setConfirmKey(`purchase-${row.id}`)}>🗑️</button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroller>
          <Pagination total={purchases.length} page={page} onChange={setPage} />
          <p className="table-hint">
            {purchases.length} record{purchases.length !== 1 ? "s" : ""} · Click any row to view details
          </p>
        </>
      )}
    </div>
  );
}
