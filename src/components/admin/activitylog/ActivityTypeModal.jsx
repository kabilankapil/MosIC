// src/components/admin/activityLog/ActivityTypeModal.jsx
//
// Modal for managing activity types (add / edit / delete).
//
// Owns its own local fetch state (list, loading, saving) rather than
// using the ["activityTypes"] query key, because it manages temporary
// in-modal state (inline edit rows, confirm-delete) that doesn't need
// to be part of the global cache. On close, the parent calls
// refreshActivityTypes() to sync the dropdown.
//
// Props:
//   role    — user role string
//   onClose — () => void

import { useState, useEffect } from "react";
import {
  getAllActivityTypes,
  createActivityType, updateActivityType, deleteActivityType,
} from "../../../api/fileActivity";
import { canEdit, canDelete, iconBtn } from "../shared/adminStyles";
import { ConfirmDelete } from "../shared/AdminTable";
import { useToast } from "../shared/ToastContext";

export default function ActivityTypeModal({ role, onClose }) {
  const toast = useToast();

  const [list, setList]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [name, setName]           = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName]   = useState("");
  const [editStatus, setEditStatus] = useState("1");
  const [saving, setSaving]       = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = () => {
    setLoading(true);
    getAllActivityTypes()
      .then(setList)
      .catch(() => toast.error("Failed to load activity types."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createActivityType(name.trim());
      setName("");
      load();
    } catch (e) {
      toast.error(e.message || "Failed to add.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await updateActivityType(id, editName.trim(), editStatus);
      setEditingId(null);
      load();
    } catch (e) {
      toast.error(e.message || "Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    try {
      await deleteActivityType(id);
      setConfirmDel(null);
      load();
    } catch (e) {
      toast.error(e.message || "Failed to delete.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--a-surface, #0d1b1b)",
          border: "1px solid var(--a-teal-20)",
          borderRadius: 14, width: "100%", maxWidth: 540,
          maxHeight: "85vh", display: "flex", flexDirection: "column",
          boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "18px 22px 14px",
          borderBottom: "1px solid var(--a-teal-10)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--a-teal)" }}>
              Manage Activity Types
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "var(--a-text-faint)" }}>
              Add, edit, or remove activity types used in File Index
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "1.1rem", color: "var(--a-text-faint)", lineHeight: 1, padding: "4px 6px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Add form — edit-capable roles only */}
        {canEdit(role) && (
          <div style={{ padding: "14px 22px", borderBottom: "1px solid var(--a-teal-08)" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="activity-input"
                style={{ flex: 1, boxSizing: "border-box" }}
                placeholder="New activity type name…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <button
                className="act-btn act-save"
                style={{ padding: "0 18px", whiteSpace: "nowrap" }}
                onClick={handleAdd}
                disabled={saving || !name.trim()}
              >
                {saving ? "…" : "+ Add"}
              </button>
            </div>
          </div>
        )}

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {loading ? (
            <p style={{ textAlign: "center", color: "var(--a-text-faint)", padding: "24px 0", fontSize: "0.85rem" }}>
              Loading…
            </p>
          ) : list.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--a-text-faint)", padding: "24px 0", fontSize: "0.85rem" }}>
              No activity types yet.
            </p>
          ) : list.map((t, idx) => (
            <div
              key={t.id}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 22px",
                background: idx % 2 === 0 ? "transparent" : "var(--a-teal-04, rgba(20,184,166,0.04))",
                borderBottom: "1px solid var(--a-teal-04)",
              }}
            >
              {editingId === t.id ? (
                <>
                  <input
                    className="activity-input"
                    style={{ flex: 1, boxSizing: "border-box" }}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUpdate(t.id)}
                  />
                  <select
                    className="activity-input"
                    style={{ width: 110 }}
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                  <button
                    className="act-btn act-save"
                    style={{ padding: "3px 12px", fontSize: "0.78rem" }}
                    onClick={() => handleUpdate(t.id)}
                    disabled={saving}
                  >
                    Save
                  </button>
                  <button
                    className="act-btn act-cancel"
                    style={{ padding: "3px 10px", fontSize: "0.78rem" }}
                    onClick={() => setEditingId(null)}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontSize: "0.875rem", color: "var(--a-text)" }}>{t.name}</span>
                  <span style={{
                    fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                    background: t.status === "1" ? "rgba(20,184,166,0.12)" : "rgba(100,116,139,0.12)",
                    color: t.status === "1" ? "var(--a-teal)" : "var(--a-text-faint)",
                    border: `1px solid ${t.status === "1" ? "var(--a-teal-20)" : "rgba(100,116,139,0.2)"}`,
                  }}>
                    {t.status === "1" ? "Active" : "Inactive"}
                  </span>
                  {canEdit(role) && (
                    <button
                      title="Edit"
                      style={iconBtn("var(--a-indigo,#6366f1)", "var(--a-indigo-10,rgba(99,102,241,0.1))", "var(--a-indigo-30,rgba(99,102,241,0.3))")}
                      onClick={() => { setEditingId(t.id); setEditName(t.name); setEditStatus(t.status); }}
                    >
                      ✏️
                    </button>
                  )}
                  {canDelete(role) && (
                    confirmDel === t.id ? (
                      <ConfirmDelete
                        onConfirm={() => handleDelete(t.id)}
                        onCancel={() => setConfirmDel(null)}
                      />
                    ) : (
                      <button
                        title="Delete"
                        style={iconBtn("var(--a-danger,#ef4444)", "var(--a-danger-10,rgba(239,68,68,0.1))", "var(--a-danger-30,rgba(239,68,68,0.3))")}
                        onClick={() => setConfirmDel(t.id)}
                      >
                        🗑️
                      </button>
                    )
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 22px",
          borderTop: "1px solid var(--a-teal-10)",
          display: "flex", justifyContent: "flex-end",
        }}>
          <button className="act-btn act-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
