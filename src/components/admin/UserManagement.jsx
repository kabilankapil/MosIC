import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUsers, registerUser, updateUser, deleteUser, updateUserStatus,
} from  "../../api/users";
import { getCurrentUser, setCurrentUser } from "../../utils/userStore";
import { ConfirmDelete } from "./shared/AdminTable";
import { useToast } from "./shared/ToastContext";

// ── constants ─────────────────────────────────────────────────────────────────

const ROLES = ["SUPER", "ADMIN", "COMMON"];

const roleBadgeStyle = (role) => {
  const map = {
    SUPER:  { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" },
    ADMIN:  { background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd" },
    COMMON: { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" },
  };
  return {
    ...(map[role] ?? map.COMMON),
    padding: "2px 10px", borderRadius: 12,
    fontSize: "0.78rem", fontWeight: 700, display: "inline-block",
  };
};

const statusBadge = (status) => ({
  background: status === 1 ? "#d1fae5" : "#fee2e2",
  color:      status === 1 ? "#065f46" : "#991b1b",
  border:     `1px solid ${status === 1 ? "#6ee7b7" : "#fca5a5"}`,
  padding: "2px 8px", borderRadius: 12,
  fontSize: "0.75rem", fontWeight: 600, display: "inline-block",
  cursor: "pointer",
});

const emptyAdd = { gmail: "", username: "", contact: "", password: "", role: "COMMON" };

// ── component ─────────────────────────────────────────────────────────────────

export default function UserManagement() {
  const currentUser = getCurrentUser();
  const toast = useToast();

  const queryClient = useQueryClient();

const { data: users = [], isLoading: loading } = useQuery({
  queryKey: ["users"],
  queryFn:  getUsers,
});
  const [confirmKey, setConfirmKey] = useState(null);

  // Add-user panel
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyAdd);

  // Inline edit panel — one row at a time
  const [editingId,   setEditingId]   = useState(null);
  const [editForm,    setEditForm]    = useState({});

  // ── data fetch ──────────────────────────────────────────────────────────────


  // ── add user ────────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    const { gmail, username, password, contact, role } = addForm;
    if (!gmail || !username || !password) { toast.error("Gmail, username and password are required."); return; }
    if (!gmail.includes("@"))             { toast.error("Enter a valid email."); return; }
    try {
      await registerUser({ gmail, username, contact, password, role });
      toast.success(`User "${username}" added as ${role}.`);
      setShowAdd(false);
      setAddForm(emptyAdd);
      queryClient.invalidateQueries(["users"]);
    } catch (e) { toast.error(e.message); }
  };

  // ── start editing a row ─────────────────────────────────────────────────────

  const startEdit = (u) => {
    setEditingId(u.id);
    setEditForm({
      username: u.username,
      contact:  u.contact ?? "",
      password: "",   // blank = don't change
      role:     u.role,
    });
  };

  // ── save edit ───────────────────────────────────────────────────────────────

  const handleEditSave = async (u) => {
    try {
      await updateUser(u.id, editForm);

      // If the current user edited their own record, refresh session data
      if (u.id === currentUser?.id) {
        setCurrentUser({
          ...currentUser,
          username: editForm.username || currentUser.username,
          contact:  editForm.contact  ?? currentUser.contact,
          role:     editForm.role     || currentUser.role,
        });
        toast.success("Profile updated.");
      } else {
        toast.success("User updated.");
      }

      setEditingId(null);
      queryClient.invalidateQueries(["users"]);
    } catch (e) { toast.error(e.message); }
  };

  // ── toggle active/disabled ──────────────────────────────────────────────────

  const handleToggleStatus = async (u) => {
    const newStatus = u.status === 1 ? 0 : 1;
    const label     = newStatus === 1 ? "enabled" : "disabled";
    try {
      await updateUserStatus(u.id, newStatus);
      toast.success(`"${u.username}" is now ${label}.`);
      queryClient.invalidateQueries(["users"]);
    } catch (e) { toast.error(e.message); }
  };

  // ── delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async (u) => {
    try {
      await deleteUser(u.id);
      toast.success(`"${u.username}" deleted.`);
      queryClient.invalidateQueries(["users"]);
    } catch (e) { toast.error(e.message); }
  };

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="content-section">

      {/* ── Header ── */}
      <div className="activity-header">
        <h1>User Management</h1>
        <button
          className="activity-add-btn"
          onClick={() => { setShowAdd(true); setAddForm(emptyAdd); }}
        >
          + Add User
        </button>
      </div>



      {/* ── Add-user form ── */}
      {showAdd && (
        <div
          className="activity-form-row"
          style={{ flexWrap: "wrap", gap: 10, marginBottom: 20, alignItems: "center" }}
        >
          <input
            className="activity-input" placeholder="Email *"
            value={addForm.gmail}
            onChange={(e) => setAddForm({ ...addForm, gmail: e.target.value })}
          />
          <input
            className="activity-input" placeholder="Username *"
            value={addForm.username}
            onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
          />
          <input
            className="activity-input" placeholder="Contact"
            value={addForm.contact}
            onChange={(e) => setAddForm({ ...addForm, contact: e.target.value })}
          />
          <input
            className="activity-input" placeholder="Password *" type="password"
            value={addForm.password}
            onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
          />
          <select
            className="activity-input"
            value={addForm.role}
            onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
          >
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="activity-form-actions">
            <button className="act-btn act-save"   onClick={handleAdd}>Save</button>
            <button className="act-btn act-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Users table ── */}
      {loading ? (
        <p style={{ color: "var(--color-text-secondary)", padding: "20px 0" }}>Loading users…</p>
      ) : (
        <div className="activity-table-wrap">
          <table className="activity-table">
            <thead>
              <tr>
                <th>#</th>
                <th>USERNAME</th>
                <th>EMAIL</th>
                <th>CONTACT</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const isSelf    = u.id === currentUser?.id;
                const isEditing = editingId === u.id;

                return (
                  <tr key={u.id} style={isSelf ? { background: "var(--color-bg-hover, rgba(0,0,0,0.03))" } : {}}>
                    <td>{i + 1}</td>

                    {/* ── Username cell ── */}
                    <td>
                      {isEditing ? (
                        <input
                          className="activity-input"
                          style={{ padding: "3px 8px", fontSize: "0.85rem", width: 130 }}
                          value={editForm.username}
                          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        />
                      ) : (
                        <>
                          <strong>{u.username}</strong>{" "}
                          {isSelf && <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>(you)</span>}
                        </>
                      )}
                    </td>

                    {/* ── Email cell — read-only (backend does not support gmail updates) ── */}
                    <td style={{ color: "#6b7280" }}>{u.gmail}</td>

                    {/* ── Contact cell ── */}
                    <td>
                      {isEditing ? (
                        <input
                          className="activity-input"
                          style={{ padding: "3px 8px", fontSize: "0.85rem", width: 120 }}
                          value={editForm.contact}
                          onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                        />
                      ) : (
                        <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                          {u.contact || "—"}
                        </span>
                      )}
                    </td>

                    {/* ── Role cell ── */}
                    <td>
                      {isEditing ? (
                        <select
                          className="activity-input"
                          style={{ padding: "3px 6px", fontSize: "0.8rem" }}
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <span style={roleBadgeStyle(u.role)}>{u.role}</span>
                      )}
                    </td>

                    {/* ── Status cell ── */}
                    <td>
                      {confirmKey === `status-${u.id}` ? (
                        <ConfirmDelete
                          label={u.status === 1 ? "Disable?" : "Enable?"}
                          onConfirm={() => { setConfirmKey(null); handleToggleStatus(u); }}
                          onCancel={() => setConfirmKey(null)}
                        />
                      ) : (
                        <span
                          style={statusBadge(u.status)}
                          title="Click to toggle"
                          onClick={() => !isEditing && setConfirmKey(`status-${u.id}`)}
                        >
                          {u.status === 1 ? "Active" : "Disabled"}
                        </span>
                      )}
                    </td>

                    {/* ── Actions cell ── */}
                    <td>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                          {/* Optional new password while editing */}
                          <input
                            className="activity-input"
                            style={{ padding: "3px 8px", fontSize: "0.8rem", width: 120 }}
                            type="password"
                            placeholder="New password"
                            value={editForm.password}
                            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                          />
                          <button className="act-btn act-save"   onClick={() => handleEditSave(u)}>✓ Save</button>
                          <button className="act-btn act-cancel" onClick={() => setEditingId(null)}>✕</button>
                        </div>
                      ) : (
                        <>
                          <button
                            className="act-btn act-edit"
                            onClick={() => startEdit(u)}
                            title="Edit user"
                          >
                            Edit
                          </button>
                          {/* SUPER can delete anyone except themselves */}
                          {!isSelf && (
                            confirmKey === `user-${u.id}` ? (
                              <ConfirmDelete
                                onConfirm={() => { setConfirmKey(null); handleDelete(u); }}
                                onCancel={() => setConfirmKey(null)}
                              />
                            ) : (
                              <button
                                className="act-btn act-delete"
                                onClick={() => setConfirmKey(`user-${u.id}`)}
                                title="Delete user"
                              >
                                Delete
                              </button>
                            )
                          )}
                          {isSelf && (
                            <span style={{ color: "#6b7280", fontSize: "0.75rem", marginLeft: 4 }}>
                              (edit only)
                            </span>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="table-hint">
            💡 All users are stored in the database. SUPER users can edit username, contact, role and password for any account. To hand over SUPER access: add a new SUPER user, then delete the old account.
          </p>
        </div>
      )}
    </div>
  );
}
