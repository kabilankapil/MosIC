// ── src/api/users.js ──────────────────────────────────────────────────────────
import { BASE_URL } from "./_base";
import { authHeaders } from "./_auth";
import { roleToProfile, profileToRole } from "./auth";  // ← add profileToRole


export async function getUsers() {
  const res = await fetch(`${BASE_URL}/api/auth/users`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch users.");
  const data = await res.json();
  return data.map(u => ({ ...u, role: profileToRole(u.profile) }));
}

export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      gmail: data.gmail,
      username: data.username,
      contact: data.contact,
      password: data.password,
      profile: roleToProfile(data.role),  // "COMMON" → "USER" etc.
    }),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Failed to add user.");
  return res.json();
}

export async function updateUser(id, data) {
  const res = await fetch(`${BASE_URL}/api/auth/users/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      username: data.username,
      contact: data.contact,
      password: data.password,
      profile: roleToProfile(data.role),  // "COMMON" → "USER" etc.
    }),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Failed to update user.");
  return res.json();
}

export async function updateUserStatus(id, status) {
  const res = await fetch(`${BASE_URL}/api/auth/users/${id}/status`, {
    method: "PUT",                        // ← PUT not PATCH
    headers: authHeaders(),
    body: JSON.stringify({ status }),   // backend expects Map<String, Integer>
  });
  if (!res.ok) throw new Error("Failed to update status.");
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`${BASE_URL}/api/auth/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete user.");
}