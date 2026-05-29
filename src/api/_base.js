/**
 * _base.js
 * ────────
 * Single source of truth for the backend base URL.
 * Set VITE_API_URL in your .env file.
 * Never hardcode http://localhost:8080 anywhere else.
 */
export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";