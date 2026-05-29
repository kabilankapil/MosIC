import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser, clearCurrentUser } from "../utils/userStore";
import { clearSession } from "../api/auth";

/**
 * AdminRoute
 * ──────────
 * Guards routes that require authentication AND a recognised role.
 *
 * Role permissions (enforced here at the route level):
 *   SUPER  — full access, including the Users tab
 *   ADMIN  — full access except the Users tab
 *   COMMON — view + add only; edit/delete buttons are hidden per-module
 *            via canEdit(role) / canDelete(role) from adminStyles.js
 *
 * Security layers:
 *  1. Checks in-memory user object + stored JWT (handles page-refresh edge case)
 *  2. Enforces role — SUPER, ADMIN, and COMMON may enter; unknown roles are rejected.
 *  3. Locks browser history so the back→forward exploit cannot re-enter admin
 *     after the user has navigated away or logged out.
 *
 * @param {{ children: React.ReactNode, requiredRoles?: string[] }} props
 *   requiredRoles defaults to ["SUPER", "ADMIN", "COMMON"].
 *   Pass requiredRoles={["SUPER"]} on routes that only superusers may access.
 */
export default function AdminRoute({
  children,
  requiredRoles = ["SUPER", "ADMIN", "COMMON"],
}) {
  const navigate = useNavigate();

  // ── Synchronous auth check — runs on EVERY render, including re-mounts
  // triggered by browser Back/Forward. This is the primary gate.
  const user  = getCurrentUser();
  const token = sessionStorage.getItem("auth_token");

  /* ── Gate 1: must be authenticated ──────────────────────────────────── */
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  /* ── Gate 2: must hold an allowed role ──────────────────────────────── */
  if (!requiredRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  /* ── History-lock: prevent Back→Forward re-entry ────────────────────── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    // Step 1 — Replace the current history entry with a sentinel.
    //   This overwrites whatever URL is "under" us (e.g. /login) so that
    //   when the user presses Back, they land on the sentinel, not /login.
    window.history.replaceState({ adminSentinel: true }, "", window.location.href);

    // Step 2 — Push a new entry on top. /admin now sits one step ahead of
    //   the sentinel. If the user presses Back, the sentinel fires popstate.
    window.history.pushState({ adminActive: true }, "", window.location.href);

    function onPopState() {
      // Any backward (or forward) navigation away from the active /admin
      // entry forces a full logout + redirect. The user cannot re-enter
      // by pressing Forward because session is cleared here.
      clearSession();       // wipes sessionStorage auth_token
      clearCurrentUser();   // wipes in-memory user

      // Replace — don't push — so there is nothing to go Forward to.
      navigate("/login", { replace: true });
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []); // intentional: run once per mount

  return children;
}
