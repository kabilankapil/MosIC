/**
 * files.js
 * ────────
 * File CRUD — talks to Java backend on port 8080.
 * Endpoint: /api/files
 *
 * Backend field names: id, fileActivity, fileSubject, fileDescription, fileDate, fileStatus
 * Frontend field names: fileId, activity, subject, description, date, status
 */

import { authHeaders } from "./_auth";

import { BASE_URL } from "./_base";

// Backend → Frontend
function fromBackend(item) {
  if (!item) return item;
  return {
    fileId:      item.id,
    activity:    item.fileActivity    || "",
    subject:     item.fileSubject     || "",
    description: item.fileDescription || "",
    date:        item.fileDate        || "",
    status:      item.fileStatus      || "",
  };
}

// yyyy-mm-dd → dd-mm-yyyy
function toDDMMYYYY(val) {
  if (!val) return "";
  const parts = val.split("-");
  if (parts.length !== 3) return val;
  if (parts[0].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return val; // already dd-mm-yyyy
}

// Frontend → Backend
function toBackend(data) {
  return {
    fileActivity:    data.activity    || "",
    fileSubject:     data.subject     || "",
    fileDescription: data.description || "",
    fileDate:        toDDMMYYYY(data.date) || "",
    fileStatus:      data.status      || "1",
  };
}

// GET /api/files
export async function getFiles() {
  const res = await fetch(`${BASE_URL}/api/files`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).message || "Failed to fetch files");
  const list = await res.json();
  return Array.isArray(list) ? list.map(fromBackend) : list;
}

// POST /api/files
export async function createFile(data) {
  const res = await fetch(`${BASE_URL}/api/files`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(toBackend(data)),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Failed to create file");
  return fromBackend(await res.json());
}

// PUT /api/files/{id}
export async function updateFile(fileId, data) {
  const res = await fetch(`${BASE_URL}/api/files/${fileId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(toBackend(data)),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Failed to update file");
  return fromBackend(await res.json());
}

// DELETE /api/files/{id}
export async function deleteFile(fileId) {
  const res = await fetch(`${BASE_URL}/api/files/${fileId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Failed to delete file");
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}
