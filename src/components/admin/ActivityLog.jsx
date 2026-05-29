// src/components/admin/ActivityLog.jsx
//
// 3-level view: File list → Activity list → Activity detail.
// Owns ["files"] and ["activityTypes"] React Query keys.
//
// Sub-components (./activityLog/):
//   ActivityTypeModal     — manage activity types popup
//
// Constants / helpers (./activityLog/):
//   activityLogConstants  — PURCHASE_DOCTYPE_OPTIONS, purchaseDoctypeLabel, emptyActForm

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFiles, createFile, updateFile, deleteFile } from "../../api/files";
import {
  getActivities, createActivity, updateActivity, deleteActivity,
  getAllActivityTypes, createActivityType,
} from "../../api/fileActivity";
import { getSales, getLineItems } from "../../api/sales";
import { getPurchaseById } from "../../api/purchases";
import { getPurchaseItemsByRef } from "../../api/purchaseItems";
import { getCustomers, getContacts } from "../../api/party";
import { getMatpassById, printMatpassPDF, buildMatpassBlobUrl } from "../../api/matpass";
import { getStockItems } from "../../api/stocks";
import { printInvoice, buildInvoiceBlobUrl } from "../../components/admin/PDFTemplates";
import DatePicker from "./DatePicker";
import StatusBadge from "./StatusBadge";
import BlobViewer from "./BlobViewer";
import { downloadBlob } from "../../hooks/useAuthBlob";
import {
  PAGE_SIZE, canEdit, canDelete, canAdd,
  fmtDate, localDate, toISODate, toSortableDate,
  thStyle, tdBase, tdNowrap, iconBtn, labelStyle, inputStyle, editCardStyle,
} from "./shared/adminStyles";
import { TableScroller, Pagination, ConfirmDelete } from "./shared/AdminTable";
import { useToast } from "./shared/ToastContext";
import ActivityTypeModal from "./activityLog/ActivityTypeModal";
import { purchaseDoctypeLabel, emptyActForm } from "./activityLog/activityLogConstants";

export default function ActivityLog({ role = "COMMON" }) {
  const toast = useToast();
  const queryClient = useQueryClient();

  // ── Queries ──────────────────────────────────────────────────
  const { data: files = [], isLoading: fileLoading } = useQuery({
    queryKey: ["files"],
    queryFn: () => getFiles().then((data) =>
      [...data].sort((a, b) => {
        const diff = toSortableDate(b.date) - toSortableDate(a.date);
        return diff !== 0 ? diff : (b.fileId ?? 0) - (a.fileId ?? 0);
      })
    ),
  });

  const { data: activityTypes = [], refetch: refreshActivityTypes } = useQuery({
    queryKey: ["activityTypes"],
    queryFn: getAllActivityTypes,
  });
  const [openFile, setOpenFile] = useState(null);   // ← moved up here
  const { data: fileActs = [], isLoading: fileActLoading } = useQuery({
    queryKey: ["activities", openFile?.fileId],
    queryFn:  () => getActivities(openFile.fileId),
    enabled:  !!openFile?.fileId,
    select:   (acts) => [...acts].sort((a, b) => {
      const diff = toSortableDate(b.date) - toSortableDate(a.date);
      return diff !== 0 ? diff : (b.id ?? 0) - (a.id ?? 0);
    }),
  });

  // ── File-level state ─────────────────────────────────────────
  const [editingFile, setEditingFile]   = useState(null);
  const [editFileForm, setEditFileForm] = useState({});
  const [showAddFile, setShowAddFile]   = useState(false);
  const [addFileForm, setAddFileForm]   = useState({
    fileId: "", activity: "", subject: "", description: "", date: localDate(), status: "ACTIVE",
  });
  const [fileSaving, setFileSaving] = useState(false);
  const [filePage, setFilePage]     = useState(1);
  const [showActTypeModal, setShowActTypeModal] = useState(false);

  // ── Drill-down state ─────────────────────────────────────────
  const [detailAct, setDetailAct]   = useState(null);

  // ── Activity-level state ─────────────────────────────────────
  //const [fileActs, setFileActs]           = useState([]);
  //const [fileActLoading, setFileActLoading] = useState(false);
  const [showAddAct, setShowAddAct]       = useState(false);
  const [addActForm, setAddActForm]       = useState(emptyActForm());
  const [addActFile, setAddActFile]       = useState(null);
  const [actSaving, setActSaving]         = useState(false);
  const [editingAct, setEditingAct]       = useState(null);
  const [editActForm, setEditActForm]     = useState({});
  const [editActFile, setEditActFile]     = useState(null);
  const [actPage, setActPage]             = useState(1);
  const addActFileRef  = useRef(null);
  const editActFileRef = useRef(null);

  // ── Inline "quick-add" activity type (in file add/edit form) ─
  const [showNewActivityInput, setShowNewActivityInput] = useState(false);
  const [newActivityName, setNewActivityName]           = useState("");
  const [addingActivityType, setAddingActivityType]     = useState(false);

  // ── Misc UI state ────────────────────────────────────────────
  const [lightbox, setLightbox]         = useState(null);
  const [confirmKey, setConfirmKey]     = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(new Set());
  const [genDocUrl, setGenDocUrl]       = useState(null);
  const [genDocLoading, setGenDocLoading] = useState(false);

  // ── Inline validation errors ─────────────────────────────────
  const [addFileErrors, setAddFileErrors]   = useState({});
  const [editFileErrors, setEditFileErrors] = useState({});
  const [addActErrors, setAddActErrors]     = useState({});
  const [editActErrors, setEditActErrors]   = useState({});

  const FieldError = ({ msg }) => msg
    ? <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
        <span>⚠</span> {msg}
      </p>
    : null;

  const errBorder = (hasErr) => hasErr
    ? { outline: "1.5px solid #ef4444", border: "1px solid #ef4444" }
    : {};

  // Revoke generated blob URL on change/unmount
  useEffect(() => {
    return () => { if (genDocUrl) URL.revokeObjectURL(genDocUrl); };
  }, [genDocUrl]);

  // ── Inline quick-add activity type ───────────────────────────
  const handleCreateActivityType = async () => {
    if (!newActivityName.trim()) return;
    setAddingActivityType(true);
    try {
      await createActivityType(newActivityName.trim());
      await refreshActivityTypes();
      setAddFileForm((p) => ({ ...p, activity: newActivityName.trim() }));
      setEditFileForm((p) => ({ ...p, activity: newActivityName.trim() }));
      setAddFileErrors((p) => ({ ...p, activity: "" }));
      setNewActivityName("");
      setShowNewActivityInput(false);
    } catch (e) {
      toast.error(e.message || "Failed to add activity type.");
    } finally {
      setAddingActivityType(false);
    }
  };

  // ── File CRUD ─────────────────────────────────────────────────
  const handleAddFile = async () => {
    const { activity, subject, date, description } = addFileForm;
    const errs = {};
    if (!activity) errs.activity = "Please select an activity type.";
    if (!subject?.trim()) errs.subject = "Subject is required.";
    if (!date) errs.date = "Date is required (e.g. 28-06-2027).";
    if (!description?.trim()) errs.description = "Description is required.";
    if (Object.keys(errs).length) { setAddFileErrors(errs); return; }
    setAddFileErrors({});
    setFileSaving(true);
    try {
      const { fileId: _unused, ...payload } = addFileForm;
      const created = await createFile(payload);
      queryClient.setQueryData(["files"], (prev = []) =>
        [created, ...prev].sort((a, b) => {
          const diff = toSortableDate(b.date) - toSortableDate(a.date);
          return diff !== 0 ? diff : (b.fileId ?? 0) - (a.fileId ?? 0);
        })
      );
      setShowAddFile(false);
      setAddFileForm({ fileId: "", activity: "", subject: "", description: "", date: localDate(), status: "ACTIVE" });
      setAddFileErrors({});
      setFilePage(1);
    } catch (e) {
      toast.error(e.message || "Failed to add.");
    } finally {
      setFileSaving(false);
    }
  };

  const handleEditFile = async (fileId) => {
    const { activity, subject, date, description } = editFileForm;
    const errs = {};
    if (!activity) errs.activity = "Please select an activity type.";
    if (!subject?.trim()) errs.subject = "Subject is required.";
    if (!date) errs.date = "Date is required (e.g. 28-06-2027).";
    if (!description?.trim()) errs.description = "Description is required.";
    if (Object.keys(errs).length) { setEditFileErrors(errs); return; }
    setEditFileErrors({});
    setFileSaving(true);
    try {
      const updated = await updateFile(fileId, editFileForm);
      queryClient.setQueryData(["files"], (prev = []) =>
        prev.map((f) => f.fileId === fileId ? updated : f)
      );
      setEditingFile(null);
      setEditFileErrors({});
    } catch {
      toast.error("Failed to save.");
    } finally {
      setFileSaving(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await deleteFile(fileId);
      queryClient.setQueryData(["files"], (prev = []) =>
        prev.filter((f) => f.fileId !== fileId)
      );
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const openFileDetail = async (file) => {
    setOpenFile(file);
    setShowAddAct(false);
    setLightbox(null); setDetailAct(null); setActPage(1);
  };

  const backToFiles = () => {
    setOpenFile(null); setLightbox(null); setDetailAct(null);
    if (genDocUrl) { URL.revokeObjectURL(genDocUrl); setGenDocUrl(null); }
  };

  // ── Activity CRUD ────────────────────────────────────────────
  const handleAddAct = async () => {
    const errs = {};
    if (!addActForm.date) errs.date = "Date is required (e.g. 28-06-2027).";
    if (!addActForm.description?.trim()) errs.description = "Description is required.";
    if (Object.keys(errs).length) { setAddActErrors(errs); return; }
    setAddActErrors({});
    setActSaving(true);
    try {
      const created = await createActivity(openFile.fileId, addActForm, addActFile);
      queryClient.setQueryData(["activities", openFile.fileId], (old = []) =>
  [created, ...old].sort((a, b) => {
    const diff = toSortableDate(b.date) - toSortableDate(a.date);
    return diff !== 0 ? diff : (b.id ?? 0) - (a.id ?? 0);
  })
);
      setShowAddAct(false); setAddActForm(emptyActForm()); setAddActFile(null); setAddActErrors({}); setActPage(1);
    } catch (e) {
      toast.error(e.message || "Failed to add activity.");
    } finally {
      setActSaving(false);
    }
  };

  const handleEditAct = async (id) => {
    const errs = {};
    if (!editActForm.date) errs.date = "Date is required (e.g. 28-06-2027).";
    if (!editActForm.description?.trim()) errs.description = "Description is required.";
    if (Object.keys(errs).length) { setEditActErrors(errs); return; }
    setEditActErrors({});
    setActSaving(true);
    try {
      const updated = await updateActivity(id, { ...editActForm, fileId: openFile.fileId }, editActFile);
      setFileActs((p) => [...p.map((a) => a.id === id ? updated : a)].sort((a, b) => {
        const diff = toSortableDate(b.date) - toSortableDate(a.date);
        return diff !== 0 ? diff : (b.id ?? 0) - (a.id ?? 0);
      }));
      setEditingAct(null); setEditActFile(null); setEditActErrors({});
    } catch {
      toast.error("Failed to save.");
    } finally {
      setActSaving(false);
    }
  };

  const handleDeleteAct = async (act) => {
    try {
      await deleteActivity(act.id, act.blobId);
      //setFileActs((p) => p.filter((a) => a.id !== act.id));
      queryClient.setQueryData(["activities", openFile.fileId], (old = []) =>
  old.filter((a) => a.id !== act.id)
);
      if (lightbox?.blobId === act.blobId) setLightbox(null);
      if (detailAct?.id === act.id) setDetailAct(null);
    } catch {
      toast.error("Failed to delete.");
    }
  };

  // ── Document preview helpers ─────────────────────────────────
  const handleViewInvoice = async (act) => {
    const { saleId, purchaseId } = act;
    if (!saleId && !purchaseId) return;
    setGenDocLoading(true);
    setGenDocUrl(null);
    try {
      const customers = await getCustomers();
      if (saleId) {
        const [allSales, items] = await Promise.all([getSales(), getLineItems(saleId)]);
        const sale = allSales.find((s) => s.id === saleId);
        if (!sale) { toast.error("Sale record not found."); return; }
        let contactName = sale.addressedTo;
        if (sale.addressedTo && sale.toParty) {
          try {
            const contacts = await getContacts(sale.toParty);
            const c = contacts.find((c) => String(c.id) === String(sale.addressedTo));
            if (c) contactName = c.name;
          } catch { /* use raw id */ }
        }
        const toParty = customers.find((c) => String(c.id) === String(sale.toParty)) || {};
        setGenDocUrl(buildInvoiceBlobUrl({
          docType: sale.documentType, refNo: String(sale.id),
          date: sale.date, validity: sale.validity, currency: sale.currency,
          toParty, contactName,
          paymentTerms: sale.paymentTerms, deliveryTerms: sale.deliveryTerms,
          description: sale.description, items,
        }));
      } else {
        const purchase = await getPurchaseById(purchaseId);
        const items = await getPurchaseItemsByRef(purchase.purchaseFileRef);
        let contactName = purchase.purchaseAddressedTo;
        if (purchase.purchaseAddressedTo && purchase.purchaseToParty) {
          try {
            const contacts = await getContacts(purchase.purchaseToParty);
            const c = contacts.find((c) => String(c.id) === String(purchase.purchaseAddressedTo));
            if (c) contactName = c.name;
          } catch { /* use raw id */ }
        }
        const toParty = customers.find((c) => String(c.id) === String(purchase.purchaseToParty)) || {};
        setGenDocUrl(buildInvoiceBlobUrl({
          docType: purchaseDoctypeLabel(purchase.purchaseDoctype),
          refNo: String(purchase.id),
          date: purchase.purchaseDate, validity: purchase.purchaseValidity,
          currency: purchase.purchaseCurrency, toParty, contactName,
          paymentTerms: purchase.purchasePaymentTerms,
          deliveryTerms: purchase.purchaseDeliveryTerms,
          description: purchase.purchaseDescription, items,
        }));
      }
    } catch (e) {
      toast.error(`Preview error: ${e.message}`);
    } finally {
      setGenDocLoading(false);
    }
  };

  const handleViewMatpassPDF = async (act) => {
    if (!act.matpassId) return;
    setGenDocLoading(true);
    setGenDocUrl(null);
    try {
      const [matpass, customers, stockItems] = await Promise.all([
        getMatpassById(act.matpassId), getCustomers(), getStockItems(),
      ]);
      const url = await buildMatpassBlobUrl({ row: matpass, customers, stockItems, toast });
      if (url) setGenDocUrl(url);
    } catch (e) {
      toast.error(`Preview error: ${e.message}`);
    } finally {
      setGenDocLoading(false);
    }
  };

  // ── Document print helpers ───────────────────────────────────
  const handleInvoice = async (act) => {
    const { saleId, purchaseId } = act;
    if (!saleId && !purchaseId) return;
    setInvoiceLoading((prev) => new Set([...prev, act.id]));
    try {
      const customers = await getCustomers();
      if (saleId) {
        const [allSales, items] = await Promise.all([getSales(), getLineItems(saleId)]);
        const sale = allSales.find((s) => s.id === saleId);
        if (!sale) { toast.error("Sale record not found."); return; }
        let contactName = sale.addressedTo;
        if (sale.addressedTo && sale.toParty) {
          try {
            const contacts = await getContacts(sale.toParty);
            const c = contacts.find((c) => String(c.id) === String(sale.addressedTo));
            if (c) contactName = c.name;
          } catch { /* use raw id */ }
        }
        const toParty = customers.find((c) => String(c.id) === String(sale.toParty)) || {};
        printInvoice({
          docType: sale.documentType, refNo: String(sale.id),
          date: sale.date, validity: sale.validity, currency: sale.currency,
          toParty, contactName,
          paymentTerms: sale.paymentTerms, deliveryTerms: sale.deliveryTerms,
          description: sale.description, items,
        });
      } else {
        const purchase = await getPurchaseById(purchaseId);
        const items = await getPurchaseItemsByRef(purchase.purchaseFileRef);
        let contactName = purchase.purchaseAddressedTo;
        if (purchase.purchaseAddressedTo && purchase.purchaseToParty) {
          try {
            const contacts = await getContacts(purchase.purchaseToParty);
            const c = contacts.find((c) => String(c.id) === String(purchase.purchaseAddressedTo));
            if (c) contactName = c.name;
          } catch { /* use raw id */ }
        }
        const toParty = customers.find((c) => String(c.id) === String(purchase.purchaseToParty)) || {};
        printInvoice({
          docType: purchaseDoctypeLabel(purchase.purchaseDoctype),
          refNo: String(purchase.id),
          date: purchase.purchaseDate, validity: purchase.purchaseValidity,
          currency: purchase.purchaseCurrency, toParty, contactName,
          paymentTerms: purchase.purchasePaymentTerms,
          deliveryTerms: purchase.purchaseDeliveryTerms,
          description: purchase.purchaseDescription, items,
        });
      }
    } catch (e) {
      toast.error(`Invoice error: ${e.message}`);
    } finally {
      setInvoiceLoading((prev) => { const s = new Set(prev); s.delete(act.id); return s; });
    }
  };

  const handleMatpassPDF = async (act) => {
    if (!act.matpassId) return;
    setInvoiceLoading((prev) => new Set([...prev, act.id]));
    try {
      const [matpass, customers, stockItems] = await Promise.all([
        getMatpassById(act.matpassId), getCustomers(), getStockItems(),
      ]);
      await printMatpassPDF({ row: matpass, customers, stockItems, toast });
    } catch (e) {
      toast.error(`Matpass PDF error: ${e.message}`);
    } finally {
      setInvoiceLoading((prev) => { const s = new Set(prev); s.delete(act.id); return s; });
    }
  };

  // ── Lightbox modal ───────────────────────────────────────────
  const FileModal = () => !lightbox ? null : (
    <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
      <div className="lightbox-box" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-header">
          <span className="lightbox-name">{lightbox.name}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {lightbox.blobId && (
              <button className="detail-download-btn"
                onClick={() => downloadBlob(lightbox.blobId, lightbox.name).catch((e) => toast.error(e.message))}>
                ⬇ Download
              </button>
            )}
            <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <BlobViewer blobId={lightbox.blobId} fileType={lightbox.fileType} filename={lightbox.name}
            className={lightbox.fileType?.startsWith("image/") ? "lightbox-img" : "lightbox-pdf"} />
        </div>
      </div>
    </div>
  );

  // ── Merged activity dropdown options ─────────────────────────
  const activityTypeNames = new Set(activityTypes.map((t) => t.name));
  const legacyFileActivities = [...new Set(
    files.map((f) => f.activity).filter((a) => a && !activityTypeNames.has(a))
  )].sort((a, b) => a.localeCompare(b));
  const activityDropdownOptions = [
    ...activityTypes.map((t) => t.name).sort((a, b) => a.localeCompare(b)),
    ...legacyFileActivities,
  ];

  // ── Activity type dropdown + quick-add (reused in add & edit forms) ───────
  const ActivityTypeField = ({ value, onChange, errors, setErrors }) => (
    <div>
      <label style={labelStyle}>Activity *</label>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
        {showNewActivityInput ? (
          <>
            <input
              className="activity-input"
              style={{ ...inputStyle, flex: 1 }}
              placeholder="New activity type name…"
              value={newActivityName}
              autoFocus
              onChange={(e) => setNewActivityName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateActivityType();
                if (e.key === "Escape") { setShowNewActivityInput(false); setNewActivityName(""); }
              }}
            />
            <button className="act-btn act-save" style={{ padding: "0 10px", whiteSpace: "nowrap", fontSize: "0.78rem", height: 36 }}
              onClick={handleCreateActivityType} disabled={addingActivityType || !newActivityName.trim()}>
              {addingActivityType ? "…" : "✓"}
            </button>
            <button className="act-btn act-cancel" style={{ padding: "0 10px", height: 36 }}
              onClick={() => { setShowNewActivityInput(false); setNewActivityName(""); }}>✕</button>
          </>
        ) : (
          <>
            <select
              className="activity-input"
              style={{ ...inputStyle, flex: 1, ...errBorder(errors?.activity) }}
              value={value}
              onChange={(e) => { onChange(e.target.value); setErrors?.((p) => ({ ...p, activity: "" })); }}
            >
              <option value="">— Select activity type —</option>
              {activityDropdownOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <button title="Add new activity type" className="act-btn act-save"
              style={{ padding: "0 12px", height: 36, flexShrink: 0, fontSize: "1.1rem", lineHeight: 1 }}
              onClick={() => { setShowNewActivityInput(true); setNewActivityName(""); }}>
              +
            </button>
          </>
        )}
      </div>
      <FieldError msg={errors?.activity} />
    </div>
  );

  // ── Level 2: Activity detail ──────────────────────────────────
  if (openFile && detailAct) {
    return (
      <div className="content-section">
        <div className="activity-header">
          <div className="act-breadcrumb">
            <button onClick={() => { setDetailAct(null); if (genDocUrl) { URL.revokeObjectURL(genDocUrl); setGenDocUrl(null); } }} className="act-back-btn">← Activities</button>
            <span className="act-breadcrumb-label">
              / <strong>{openFile.activity}</strong> — Activity #{detailAct.id}
            </span>
          </div>
          {canEdit(role) && (
            <div style={{ display: "flex", gap: 6 }}>
              {(detailAct.saleId || detailAct.purchaseId) && (
                <button style={iconBtn("var(--a-teal)", "var(--a-teal-05)", "var(--a-teal-20)")}
                  title="Generate Invoice" onClick={() => handleInvoice(detailAct)}
                  disabled={invoiceLoading.has(detailAct.id)}>
                  {invoiceLoading.has(detailAct.id) ? "⏳" : "🖨️"}
                </button>
              )}
              {detailAct.matpassId && (
                <button style={iconBtn("var(--a-teal)", "var(--a-teal-05)", "var(--a-teal-20)")}
                  title="Download MAT Pass PDF" onClick={() => handleMatpassPDF(detailAct)}
                  disabled={invoiceLoading.has(detailAct.id)}>
                  {invoiceLoading.has(detailAct.id) ? "⏳" : "📄"}
                </button>
              )}
              <button title="Edit"
                style={iconBtn("var(--a-indigo,#6366f1)", "var(--a-indigo-10,rgba(99,102,241,0.1))", "var(--a-indigo-30,rgba(99,102,241,0.3))")}
                onClick={() => { setDetailAct(null); setEditingAct(detailAct.id); setEditActForm({ date: toISODate(detailAct.date), status: detailAct.status, description: detailAct.description, blobId: detailAct.blobId }); }}>
                ✏️
              </button>
              {canDelete(role) && (
                confirmKey === `act-${detailAct.id}` ? (
                  <ConfirmDelete
                    onConfirm={() => { setConfirmKey(null); handleDeleteAct(detailAct); setDetailAct(null); }}
                    onCancel={() => setConfirmKey(null)}
                  />
                ) : (
                  <button title="Delete"
                    style={iconBtn("var(--a-danger,#ef4444)", "var(--a-danger-10,rgba(239,68,68,0.1))", "var(--a-danger-30,rgba(239,68,68,0.3))")}
                    onClick={() => setConfirmKey(`act-${detailAct.id}`)}>🗑️</button>
                )
              )}
            </div>
          )}
        </div>

        {/* Detail card */}
        <div style={{
          background: "var(--a-surface, #fff)",
          border: "1px solid var(--a-border-card, rgba(20,184,166,0.2))",
          borderRadius: 14, overflow: "hidden", marginBottom: 20,
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}>
          <div style={{
            background: "linear-gradient(135deg, var(--a-teal-15,rgba(20,184,166,0.15)), var(--a-teal-08,rgba(20,184,166,0.08)))",
            borderBottom: "1px solid var(--a-border-card, rgba(20,184,166,0.2))",
            padding: "20px 28px",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          }}>
            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--a-teal)", marginBottom: 4 }}>
                Activity Detail
              </div>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "var(--a-text, #0f172a)" }}>
                #{detailAct.id} — {fmtDate(detailAct.date)}
              </h2>
            </div>
            {(detailAct.saleId || detailAct.purchaseId || detailAct.matpassId) && (
              <span style={{
                background: "var(--a-teal-15)", color: "var(--a-teal)",
                border: "1px solid var(--a-teal-30)", borderRadius: 20,
                padding: "4px 14px", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.04em",
              }}>
                {detailAct.saleId ?? detailAct.purchaseId ?? detailAct.matpassId}
              </span>
            )}
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 0, borderBottom: "1px solid var(--a-border-card, rgba(20,184,166,0.15))",
          }}>
            {[{ label: "Date", value: fmtDate(detailAct.date), icon: "📅" }].map(({ label, value, icon }) => (
              <div key={label} style={{ padding: "16px 28px", borderRight: "1px solid var(--a-border-card, rgba(20,184,166,0.1))" }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--a-text-faint, #64748b)", marginBottom: 6 }}>
                  {icon} {label}
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--a-text, #0f172a)" }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: "20px 28px" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--a-text-faint, #64748b)", marginBottom: 10 }}>
              📝 Description
            </div>
            <div style={{
              color: "var(--a-text-body, #1e293b)", lineHeight: 1.75, fontSize: "0.95rem",
              whiteSpace: "pre-wrap", wordBreak: "break-word",
              background: "var(--a-teal-05, rgba(20,184,166,0.04))",
              border: "1px solid var(--a-teal-10, rgba(20,184,166,0.1))",
              borderRadius: 8, padding: "14px 18px", minHeight: 48,
            }}>
              {detailAct.description || <span style={{ color: "var(--a-text-faint)", fontStyle: "italic" }}>No description provided.</span>}
            </div>
          </div>
        </div>

        {/* Attached file card */}
        <div className="detail-file-card">
          {detailAct.blobId ? (
            <>
              <div className="detail-file-header">
                <h3 className="detail-file-heading">📎 Attached File</h3>
                <button className="detail-download-btn"
                  onClick={() => downloadBlob(detailAct.blobId, detailAct.title).catch((e) => toast.error(e.message))}>
                  ⬇ Download
                </button>
              </div>
              <BlobViewer blobId={detailAct.blobId} fileType={detailAct.fileType} filename={detailAct.title} />
            </>
          ) : (detailAct.saleId || detailAct.purchaseId) ? (
            <>
              <div className="detail-file-header">
                <h3 className="detail-file-heading">🖨️ Generated Document</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  {genDocUrl && <button className="detail-download-btn" onClick={() => handleInvoice(detailAct)} disabled={invoiceLoading.has(detailAct.id)}>🖨️ Print</button>}
                  {genDocUrl && <button className="detail-download-btn" onClick={() => { URL.revokeObjectURL(genDocUrl); setGenDocUrl(null); }}>✕ Close</button>}
                </div>
              </div>
              {genDocUrl ? (
                <iframe src={genDocUrl} title="Invoice Preview" className="detail-file-iframe" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "36px 20px", color: "var(--a-text-faint)" }}>
                  <span style={{ fontSize: "0.9rem" }}>This activity has an auto-generated {detailAct.saleId ? "Sales" : "Purchase"} document.</span>
                  <button className="act-btn act-save" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.95rem", padding: "10px 24px" }}
                    onClick={() => handleViewInvoice(detailAct)} disabled={genDocLoading}>
                    {genDocLoading ? "⏳ Loading..." : "📄 View Document"}
                  </button>
                </div>
              )}
            </>
          ) : detailAct.matpassId ? (
            <>
              <div className="detail-file-header">
                <h3 className="detail-file-heading">📄 Generated Document</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  {genDocUrl && <button className="detail-download-btn" onClick={() => handleMatpassPDF(detailAct)} disabled={invoiceLoading.has(detailAct.id)}>🖨️ Print</button>}
                  {genDocUrl && <button className="detail-download-btn" onClick={() => { URL.revokeObjectURL(genDocUrl); setGenDocUrl(null); }}>✕ Close</button>}
                </div>
              </div>
              {genDocUrl ? (
                <iframe src={genDocUrl} title="MAT Pass Preview" className="detail-file-iframe" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "36px 20px", color: "var(--a-text-faint)" }}>
                  <span style={{ fontSize: "0.9rem" }}>This activity has an auto-generated MAT Pass document.</span>
                  <button className="act-btn act-save" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.95rem", padding: "10px 24px" }}
                    onClick={() => handleViewMatpassPDF(detailAct)} disabled={genDocLoading}>
                    {genDocLoading ? "⏳ Loading..." : "📄 View Document"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "22px 28px", color: "var(--a-text-faint)", fontSize: "0.875rem", fontStyle: "italic" }}>
              <span style={{ fontSize: "1.1rem", opacity: 0.5 }}>📎</span>
              No attached file.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Level 1: Activity list ────────────────────────────────────
  if (openFile) {
    const actColSpan = canEdit(role) ? 4 : 3;
    const pagedActs = fileActs.slice((actPage - 1) * PAGE_SIZE, actPage * PAGE_SIZE);

    return (
      <div className="content-section">
        <FileModal />
        <div className="activity-header">
          <div className="act-breadcrumb">
            <button onClick={backToFiles} className="act-back-btn">← Files</button>
            <span className="act-breadcrumb-label">
              / <strong>{openFile.activity}</strong> — {openFile.subject}
            </span>
          </div>
          {canAdd(role) && (
            <button className="activity-add-btn" onClick={() => { setShowAddAct(true); setAddActForm(emptyActForm()); setAddActFile(null); }}>
              + Add Activity
            </button>
          )}
        </div>

        {canAdd(role) && showAddAct && (
          <div style={{ ...editCardStyle, marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "1rem", fontWeight: 700, color: "var(--a-teal)" }}>New Activity</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
              <div>
                <label style={labelStyle}>Date *</label>
                <div style={{ ...errBorder(addActErrors.date), borderRadius: 6 }}>
                  <DatePicker value={addActForm.date}
                    onChange={(date) => { setAddActForm({ ...addActForm, date }); setAddActErrors((p) => ({ ...p, date: "" })); }} />
                </div>
                <FieldError msg={addActErrors.date} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={labelStyle}>Description *</label>
                <textarea className="activity-input activity-textarea"
                  style={{ ...inputStyle, minHeight: 72, resize: "vertical", ...errBorder(addActErrors.description) }}
                  placeholder="Details..." value={addActForm.description}
                  onChange={(e) => { setAddActForm({ ...addActForm, description: e.target.value }); setAddActErrors((p) => ({ ...p, description: "" })); }} />
                <FieldError msg={addActErrors.description} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={labelStyle}>Attach File (image or PDF)</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, ...(addActErrors.file ? { outline: "1.5px solid #ef4444", borderRadius: 6, padding: "4px 6px" } : {}) }}>
                  <input type="file" ref={addActFileRef} accept="image/*,application/pdf" style={{ display: "none" }}
                    onChange={(e) => { setAddActFile(e.target.files[0] || null); setAddActErrors((p) => ({ ...p, file: "" })); }} />
                  <button className="act-btn act-upload" onClick={() => addActFileRef.current.click()}>📎 Choose File</button>
                  {addActFile && <span className="activity-file-count">📄 {addActFile.name}</span>}
                  {addActFile && <button className="act-btn act-cancel" onClick={() => setAddActFile(null)}>✕</button>}
                </div>
                <FieldError msg={addActErrors.file} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="act-btn act-save" onClick={handleAddAct} disabled={actSaving}>{actSaving ? "Saving..." : "Save Activity"}</button>
              <button className="act-btn act-cancel" onClick={() => { setShowAddAct(false); setAddActFile(null); setAddActErrors({}); }}>Cancel</button>
            </div>
          </div>
        )}

        {fileActLoading ? <p className="loading">Loading activities...</p> : (
          <>
            <div className="activity-table-wrap">
              <TableScroller>
                <table className="activity-table" style={{ minWidth: 500 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 52 }}>#</th>
                      <th style={{ width: 120 }}>Date</th>
                      <th>Description</th>
                      {canEdit(role) && <th style={{ textAlign: "center", width: 100 }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {fileActs.length === 0 ? (
                      <tr><td colSpan={actColSpan} className="activity-empty">
                        {canEdit(role) ? "No activities yet. Click \"+ Add Activity\" to start." : "No activities yet."}
                      </td></tr>
                    ) : pagedActs.map((act, idx) => (
                      <tr key={act.id}
                        style={{ cursor: editingAct === act.id ? "default" : "pointer", background: idx % 2 === 0 ? "transparent" : "var(--a-teal-04, rgba(20,184,166,0.04))" }}
                        onMouseEnter={(e) => { if (editingAct !== act.id) e.currentTarget.style.background = "var(--a-teal-10, rgba(20,184,166,0.10))"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? "transparent" : "var(--a-teal-04, rgba(20,184,166,0.04))"; }}>
                        {editingAct === act.id ? (
                          <td colSpan={actColSpan} style={{ padding: 0 }}>
                            <div style={editCardStyle}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
                                <div>
                                  <label style={labelStyle}>Date *</label>
                                  <div style={{ ...errBorder(editActErrors.date), borderRadius: 6 }}>
                                    <DatePicker value={editActForm.date}
                                      onChange={(date) => { setEditActForm({ ...editActForm, date }); setEditActErrors((p) => ({ ...p, date: "" })); }} />
                                  </div>
                                  <FieldError msg={editActErrors.date} />
                                </div>
                                <div>
                                  <label style={labelStyle}>Attach File {editActForm.blobId ? "(Replace)" : "(optional)"}</label>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, ...(editActErrors.file ? { outline: "1.5px solid #ef4444", borderRadius: 6, padding: "4px 6px" } : {}) }}>
                                    <input type="file" ref={editActFileRef} accept="image/*,application/pdf" style={{ display: "none" }}
                                      onChange={(e) => { setEditActFile(e.target.files[0] || null); setEditActErrors((p) => ({ ...p, file: "" })); }} />
                                    <button className="act-btn act-upload" onClick={() => editActFileRef.current.click()}>
                                      📎 {editActFile ? editActFile.name : "Replace File"}
                                    </button>
                                  </div>
                                  <FieldError msg={editActErrors.file} />
                                </div>
                                <div style={{ gridColumn: "1/-1" }}>
                                  <label style={labelStyle}>Description *</label>
                                  <textarea className="activity-input activity-textarea"
                                    style={{ ...inputStyle, minHeight: 72, resize: "vertical", ...errBorder(editActErrors.description) }}
                                    value={editActForm.description}
                                    onChange={(e) => { setEditActForm({ ...editActForm, description: e.target.value }); setEditActErrors((p) => ({ ...p, description: "" })); }} />
                                  <FieldError msg={editActErrors.description} />
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                                <button className="act-btn act-save" onClick={() => handleEditAct(act.id)} disabled={actSaving}>{actSaving ? "Saving..." : "Save"}</button>
                                <button className="act-btn act-cancel" onClick={() => { setEditingAct(null); setEditActFile(null); setEditActErrors({}); }}>Cancel</button>
                              </div>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td style={{ color: "var(--a-teal)", fontWeight: 700, whiteSpace: "nowrap" }} onClick={() => setDetailAct(act)}>{act.id}</td>
                            <td style={{ whiteSpace: "nowrap" }} onClick={() => setDetailAct(act)}>{fmtDate(act.date)}</td>
                            <td style={{ color: "var(--a-text-muted)", maxWidth: 340, whiteSpace: "normal", wordBreak: "break-word" }} onClick={() => setDetailAct(act)}>{act.description || "—"}</td>
                            {canEdit(role) && (
                              <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                                <button title="Edit"
                                  style={iconBtn("var(--a-indigo,#6366f1)", "var(--a-indigo-10,rgba(99,102,241,0.1))", "var(--a-indigo-30,rgba(99,102,241,0.3))")}
                                  onClick={(e) => { e.stopPropagation(); setEditingAct(act.id); setEditActForm({ date: toISODate(act.date), status: act.status, description: act.description, blobId: act.blobId }); }}>✏️</button>
                                {canDelete(role) && (
                                  confirmKey === `act-${act.id}` ? (
                                    <ConfirmDelete onConfirm={() => { setConfirmKey(null); handleDeleteAct(act); }} onCancel={() => setConfirmKey(null)} />
                                  ) : (
                                    <button title="Delete"
                                      style={iconBtn("var(--a-danger,#ef4444)", "var(--a-danger-10,rgba(239,68,68,0.1))", "var(--a-danger-30,rgba(239,68,68,0.3))")}
                                      onClick={(e) => { e.stopPropagation(); setConfirmKey(`act-${act.id}`); }}>🗑️</button>
                                  )
                                )}
                              </td>
                            )}
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableScroller>
            </div>
            <Pagination total={fileActs.length} page={actPage} onChange={setActPage} />
            <p className="table-hint">💡 Click any row to view activity details and attached file</p>
          </>
        )}
      </div>
    );
  }

  // ── Level 0: File list ────────────────────────────────────────
  const fileColSpan = canEdit(role) ? 7 : 6;
  const pagedFiles = files.slice((filePage - 1) * PAGE_SIZE, filePage * PAGE_SIZE);

  return (
    <div className="content-section">
      {showActTypeModal && (
        <ActivityTypeModal
          role={role}
          onClose={() => { setShowActTypeModal(false); refreshActivityTypes(); }}
        />
      )}

      <div className="activity-header" style={{ alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>List of Files</h1>
        {canAdd(role) && !editingFile && (
          <button className="activity-add-btn" onClick={() => {
            setShowAddFile(true);
            setAddFileForm({ fileId: "", activity: "", subject: "", description: "", date: localDate(), status: "ACTIVE" });
          }}>
            + Add File
          </button>
        )}
      </div>

      {canAdd(role) && showAddFile && (
        <div style={{ ...editCardStyle, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button className="act-back-btn" onClick={() => setShowAddFile(false)}>← Back</button>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--a-teal)" }}>New File</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
            <ActivityTypeField
              value={addFileForm.activity}
              onChange={(v) => setAddFileForm({ ...addFileForm, activity: v })}
              errors={addFileErrors}
              setErrors={setAddFileErrors}
            />
            <div>
              <label style={labelStyle}>Subject *</label>
              <input className="activity-input" style={{ ...inputStyle, ...errBorder(addFileErrors.subject) }} placeholder="e.g. Purchase of goods"
                value={addFileForm.subject} onChange={(e) => { setAddFileForm({ ...addFileForm, subject: e.target.value }); setAddFileErrors((p) => ({ ...p, subject: "" })); }} />
              <FieldError msg={addFileErrors.subject} />
            </div>
            <div>
              <label style={labelStyle}>Date *</label>
              <div style={{ ...errBorder(addFileErrors.date), borderRadius: 6 }}>
                <DatePicker value={addFileForm.date}
                  onChange={(date) => { setAddFileForm({ ...addFileForm, date }); setAddFileErrors((p) => ({ ...p, date: "" })); }} />
              </div>
              <FieldError msg={addFileErrors.date} />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select className="activity-input" style={inputStyle} value={addFileForm.status}
                onChange={(e) => setAddFileForm({ ...addFileForm, status: e.target.value })}>
                <option value="ACTIVE">Active</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Description *</label>
              <textarea className="activity-input activity-textarea"
                style={{ ...inputStyle, minHeight: 64, resize: "vertical", ...errBorder(addFileErrors.description) }}
                placeholder="Optional details..."
                value={addFileForm.description} onChange={(e) => { setAddFileForm({ ...addFileForm, description: e.target.value }); setAddFileErrors((p) => ({ ...p, description: "" })); }} />
              <FieldError msg={addFileErrors.description} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="act-btn act-save" onClick={handleAddFile} disabled={fileSaving}>{fileSaving ? "Saving..." : "Save"}</button>
            <button className="act-btn act-cancel" onClick={() => { setShowAddFile(false); setAddFileErrors({}); }}>Cancel</button>
          </div>
        </div>
      )}

      {fileLoading ? <p className="loading">Loading...</p> : (
        <>
          <div className="activity-table-wrap">
            <TableScroller>
              <table className="activity-table" style={{ minWidth: 640 }}>
                <thead>
                  <tr>
                    <th style={{ width: 52 }}>ID</th>
                    <th style={{ width: 120 }}>Date</th>
                    <th>File</th>
                    <th>Subject</th>
                    <th style={{ width: 100 }}>Status</th>
                    <th>Description</th>
                    {canEdit(role) && <th style={{ textAlign: "center", width: 100 }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {files.length === 0 ? (
                    <tr><td colSpan={fileColSpan} className="activity-empty">
                      {canEdit(role) ? "No files found. Click \"+ Add File\" to create one." : "No files found."}
                    </td></tr>
                  ) : pagedFiles.map((row, idx) => (
                    <tr key={row.fileId}
                      style={{ cursor: editingFile === row.fileId ? "default" : "pointer", background: idx % 2 === 0 ? "transparent" : "var(--a-teal-04, rgba(20,184,166,0.04))" }}
                      onMouseEnter={(e) => { if (editingFile !== row.fileId) e.currentTarget.style.background = "var(--a-teal-10, rgba(20,184,166,0.10))"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? "transparent" : "var(--a-teal-04, rgba(20,184,166,0.04))"; }}>
                      {editingFile === row.fileId ? (
                        <td colSpan={fileColSpan} style={{ padding: 0 }}>
                          <div style={editCardStyle}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                              <button className="act-back-btn" onClick={() => { setEditingFile(null); setEditFileErrors({}); }}>← Back</button>
                              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--a-teal)" }}>Edit File</h3>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
                              <ActivityTypeField
                                value={editFileForm.activity}
                                onChange={(v) => setEditFileForm({ ...editFileForm, activity: v })}
                                errors={editFileErrors}
                                setErrors={setEditFileErrors}
                              />
                              <div>
                                <label style={labelStyle}>Subject *</label>
                                <input className="activity-input" style={{ ...inputStyle, ...errBorder(editFileErrors.subject) }} value={editFileForm.subject}
                                  onChange={(e) => { setEditFileForm({ ...editFileForm, subject: e.target.value }); setEditFileErrors((p) => ({ ...p, subject: "" })); }} />
                                <FieldError msg={editFileErrors.subject} />
                              </div>
                              <div>
                                <label style={labelStyle}>Date *</label>
                                <div style={{ ...errBorder(editFileErrors.date), borderRadius: 6 }}>
                                  <DatePicker value={editFileForm.date}
                                    onChange={(date) => { setEditFileForm({ ...editFileForm, date }); setEditFileErrors((p) => ({ ...p, date: "" })); }} />
                                </div>
                                <FieldError msg={editFileErrors.date} />
                              </div>
                              <div>
                                <label style={labelStyle}>Status</label>
                                <select className="activity-input" style={inputStyle}
                                  value={["ACTIVE", "CLOSED"].includes(String(editFileForm.status || "").toUpperCase()) ? String(editFileForm.status).toUpperCase() : "ACTIVE"}
                                  onChange={(e) => setEditFileForm({ ...editFileForm, status: e.target.value })}>
                                  <option value="ACTIVE">Active</option>
                                  <option value="CLOSED">Closed</option>
                                </select>
                              </div>
                              <div style={{ gridColumn: "1/-1" }}>
                                <label style={labelStyle}>Description *</label>
                                <textarea className="activity-input activity-textarea"
                                  style={{ ...inputStyle, minHeight: 72, resize: "vertical", ...errBorder(editFileErrors.description) }}
                                  value={editFileForm.description}
                                  onChange={(e) => { setEditFileForm({ ...editFileForm, description: e.target.value }); setEditFileErrors((p) => ({ ...p, description: "" })); }} />
                                <FieldError msg={editFileErrors.description} />
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                              <button className="act-btn act-save" onClick={() => handleEditFile(row.fileId)} disabled={fileSaving}>{fileSaving ? "Saving..." : "Save"}</button>
                              <button className="act-btn act-cancel" onClick={() => { setEditingFile(null); setEditFileErrors({}); }}>Cancel</button>
                            </div>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td style={{ color: "var(--a-teal)", fontWeight: 700, whiteSpace: "nowrap" }} onClick={() => openFileDetail(row)}>{row.fileId}</td>
                          <td style={{ whiteSpace: "nowrap" }} onClick={() => openFileDetail(row)}>{fmtDate(row.date)}</td>
                          <td onClick={() => openFileDetail(row)}><strong style={{ color: "var(--a-teal)", fontWeight: 600 }}>{row.activity}</strong></td>
                          <td onClick={() => openFileDetail(row)}>{row.subject}</td>
                          <td onClick={() => openFileDetail(row)}><StatusBadge status={row.status} /></td>
                          <td style={{ color: "var(--a-text-muted)", maxWidth: 300, whiteSpace: "normal", wordBreak: "break-word" }} onClick={() => openFileDetail(row)}>{row.description || "—"}</td>
                          {canEdit(role) && (
                            <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                              <button title="Edit"
                                style={iconBtn("var(--a-indigo,#6366f1)", "var(--a-indigo-10,rgba(99,102,241,0.1))", "var(--a-indigo-30,rgba(99,102,241,0.3))")}
                                onClick={(e) => { e.stopPropagation(); setEditingFile(row.fileId); setEditFileForm({ activity: row.activity, subject: row.subject, description: row.description, date: toISODate(row.date), status: ["ACTIVE", "CLOSED"].includes(String(row.status).toUpperCase()) ? String(row.status).toUpperCase() : "ACTIVE" }); }}>✏️</button>
                              {canDelete(role) && (
                                confirmKey === `file-${row.fileId}` ? (
                                  <ConfirmDelete label="Delete file?"
                                    onConfirm={() => { setConfirmKey(null); handleDeleteFile(row.fileId); }}
                                    onCancel={() => setConfirmKey(null)} />
                                ) : (
                                  <button title="Delete"
                                    style={iconBtn("var(--a-danger,#ef4444)", "var(--a-danger-10,rgba(239,68,68,0.1))", "var(--a-danger-30,rgba(239,68,68,0.3))")}
                                    onClick={(e) => { e.stopPropagation(); setConfirmKey(`file-${row.fileId}`); }}>🗑️</button>
                                )
                              )}
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroller>
          </div>
          <Pagination total={files.length} page={filePage} onChange={setFilePage} />
          <p className="table-hint">💡 Click any row to open its activities</p>
        </>
      )}
    </div>
  );
}
