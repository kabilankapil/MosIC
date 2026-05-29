/**
 * _auth.js
 * ────────
 * Centralised auth-header helpers — single source of truth.
 *
 * Token storage: sessionStorage (NOT localStorage).
 *   sessionStorage is scoped to the browser tab and is cleared automatically
 *   when the tab or browser is closed, reducing the window for token theft.
 *
 * Import in every api/*.js file instead of defining authHeaders() locally:
 *
 *   import { authHeaders, authHeadersMultipart, getToken } from "./_auth";
 */

/** Returns the raw JWT, or null if the user is not logged in. */
export function getToken() {
  return sessionStorage.getItem("auth_token");
}

/**
 * JSON request headers — always includes Content-Type.
 * Adds Authorization: Bearer <token> when a token exists.
 */
export function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Multipart / file-upload request headers — no Content-Type (browser sets it).
 * Adds Authorization: Bearer <token> when a token exists.
 */
export function authHeadersMultipart() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Builds a backend URL that embeds the token as a query param.
 * Used for <iframe src> / window.open() flows where fetch cannot set headers.
 */
export function tokenUrl(path) {
  const token = getToken();
  return token ? `${path}?token=${token}` : path;
}
