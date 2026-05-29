/**
 * userStore.js
 * ────────────
 * Session state only — stores the currently logged-in user object
 * for the duration of the browser tab session.
 *
 * Authentication and user management are handled entirely by the backend.
 * All users authenticate via POST /api/auth/login and receive their own
 * scoped JWT stored in sessionStorage by login.jsx.
 *
 * Storage layout:
 *   sessionStorage → current_user   (cleared on tab/browser close)
 *   sessionStorage → auth_token     (JWT, managed by login.jsx + _auth.js)
 */

const SESSION_KEY = "current_user";

/**
 * Persist the logged-in user's profile to sessionStorage.
 * Called once after a successful login response.
 *
 * @param {{ id, gmail, username, role, profile, contact, status }} user
 */
export function setCurrentUser(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

/**
 * Returns the current user object, or null if no session exists.
 */
export function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

/**
 * Wipes the current session completely.
 * Call only from the logout handler — nowhere else should clear storage directly.
 */
export function clearCurrentUser() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem("auth_token");
}