/**
 * auth.js
 * ───────
 * Auth + User-Management API — talks to Java backend on port 8080.
 *
 * Role mapping (keep in sync with backend):
 *   DB / backend  ──►  frontend display
 *   "SUPER"  ──►  "SUPER"
 *   "ADMIN"  ──►  "ADMIN"
 *   "USER"   ──►  "COMMON"
 *
 * Token storage: sessionStorage (NOT localStorage).
 *   sessionStorage is scoped to the browser tab and is automatically cleared
 *   when the tab or browser is closed — drastically reducing the window for
 *   token theft and the back→forward history exploit.
 */

import { authHeaders as _authHeaders, getToken } from "./_auth";

import { BASE_URL } from "./_base";

// ── helpers ──────────────────────────────────────────────────────────────────

// For unauthenticated calls (login) we still need a plain JSON header.
// For authenticated calls we delegate to the shared helper.
function jsonHeaders(withAuth = false) {
  return withAuth ? _authHeaders() : { "Content-Type": "application/json" };
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Returns { token, username, gmail, contact, status, profile }
 * Automatically maps `profile` → `role` for the frontend.
 */
export async function login({ email, password }) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method:  "POST",
    headers: jsonHeaders(),
    body:    JSON.stringify({ gmail: email, password }),
  });
  const data = await handleResponse(res);
  return { ...data, role: profileToRole(data.profile) };
}

/**
 * Clears all client-side session state.
 * Call this from your logout handler — do NOT clear storage manually elsewhere.
 */
export function clearSession() {
  sessionStorage.removeItem("auth_token");
  // If you have other session keys, add them here.
  // Do NOT call setCurrentUser(null) here — keep auth concerns separate.
}

/** "SUPER" | "ADMIN" | "USER"  →  "SUPER" | "ADMIN" | "COMMON" */
export function profileToRole(profile) {
  if (profile === "USER") return "COMMON";
  return profile ?? "COMMON";
}

export function roleToProfile(role) {
  if (role === "COMMON") return "USER";
  return role ?? "USER";
}