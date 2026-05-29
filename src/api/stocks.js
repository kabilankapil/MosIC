/**
 * stocks.js
 * ─────────
 * Stock Items (catalog) + Stock Movements CRUD
 * Talks to Java backend on port 8080
 *
 * Endpoints:
 *   Stock Items (catalog): /api/stock-items
 *   Stock Movements:       /api/stocks
 */

import { authHeaders } from "./_auth";

import { BASE_URL } from "./_base";

async function handleResponse(res) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// ── Stock Items (product catalog) ────────────────────────────────────────────
// Backend DTO fields (from StockItemMapper.java):
//   id, productName, openingDate, smDescription, smUnit, smOpeningBalance, status

export async function getStockItems() {
  const res = await fetch(`${BASE_URL}/api/stock-items`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createStockItem(data) {
  const res = await fetch(`${BASE_URL}/api/stock-items`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateStockItem(id, data) {
  const res = await fetch(`${BASE_URL}/api/stock-items/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteStockItem(id) {
  const res = await fetch(`${BASE_URL}/api/stock-items/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ── Stock Movements ──────────────────────────────────────────────────────────
// Backend DTO fields (from StocksMapper.java):
//   id, stockItemId, stockDate, stockDescription, stockInOut,
//   stockQuantity, stockReturnOrNonReturn, stockParty, matPassId, status

export async function getStocks() {
  const res = await fetch(`${BASE_URL}/api/stocks`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getStocksByMatpass(matpassId) {
  const res = await fetch(`${BASE_URL}/api/stocks/matpass/${matpassId}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createStock(data) {
  const res = await fetch(`${BASE_URL}/api/stocks`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateStock(id, data) {
  const res = await fetch(`${BASE_URL}/api/stocks/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteStock(id) {
  const res = await fetch(`${BASE_URL}/api/stocks/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}
