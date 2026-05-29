/**
 * matpass.js
 * ──────────
 * MAT Pass CRUD
 * Talks to Java backend on port 8080
 *
 * Endpoint: /api/matpass
 *
 * Backend DTO fields (from MatpassMapper.java):
 *   id, inOrOut, party, date, contactPerson, discription, fileRef, quantity, status
 *
 * Note: "discription" is the backend's spelling — kept intentionally to match the DTO.
 */

import { authHeaders } from "./_auth";

import { BASE_URL } from "./_base";

async function handleResponse(res) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// ── Local date formatter (dd-mm-yyyy → dd-mm-yyyy or passthrough) ────────────

function fmtDate(val) {
  if (!val) return "—";
  return val; // backend already stores as dd-mm-yyyy
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function getMatpasses() {
  const res = await fetch(`${BASE_URL}/api/matpass`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getMatpassById(id) {
  const res = await fetch(`${BASE_URL}/api/matpass/${id}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createMatpass(data) {
  const res = await fetch(`${BASE_URL}/api/matpass`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateMatpass(id, data) {
  const res = await fetch(`${BASE_URL}/api/matpass/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteMatpass(id) {
  const res = await fetch(`${BASE_URL}/api/matpass/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ── PDF generation (shared between Matpass.jsx and ActivityLog.jsx) ──────────
//
// Re-exported from PDFTemplates so both Matpass.jsx and ActivityLog.jsx get
// the same teal-themed layout as Purchase / Sales. The old _buildMatpassHTML
// builder below has been removed — PDFTemplates is the single source of truth.

export { printMatpassPDF, buildMatpassBlobUrl } from "../components/admin/PDFTemplates";
