import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // old had Link after useNavigate.
import { login } from "../api/auth";
import { setCurrentUser, getCurrentUser, clearCurrentUser } from "../utils/userStore";
import "./login.css";

// All roles that may access the panel.
// COMMON users get view + add only (enforced per-module via canEdit / canDelete).
const VALID_ROLES = ["SUPER", "ADMIN", "COMMON"];

export default function Login() {
  const nav = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // ── If already authenticated, redirect away from the login page ──────────
  // This prevents a logged-in user from hitting /login manually and also
  // ensures that pressing Back from /admin never shows the login form again
  // (AdminRoute will have cleared the session on Back, so this won't fire
  // for a logged-out user — it only fires for a still-valid session).
  useEffect(() => {
    const user  = getCurrentUser();
    const token = sessionStorage.getItem("auth_token");
    if (user && token && VALID_ROLES.includes(user.role)) {
      nav("/admin", { replace: true });
    }
  }, [nav]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleLogin(e) {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("All fields are required!");
      return;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email!");
      return;
    }

    setLoading(true);
    try {
      const data = await login({
        email:    formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // ✅ sessionStorage — token is wiped when the tab or browser closes.
      sessionStorage.setItem("auth_token", data.token);

      setCurrentUser({
        id:       data.id,
        gmail:    data.gmail,
        username: data.username,
        role:     data.role,       // already mapped by auth.js (SUPER/ADMIN/COMMON)
        profile:  data.profile,
        contact:  data.contact,
        status:   data.status,
      });

      // Reject any role that isn't recognised (e.g. a disabled/unknown account).
      if (!VALID_ROLES.includes(data.role)) {
        setError("Your account does not have access to this panel.");
        sessionStorage.removeItem("auth_token");
        clearCurrentUser();
        return;
      }

      // ✅ `replace: true` removes /login from the history stack entirely.
      //    The user cannot press Back from /admin and land on this form.
      //    AdminRoute adds its own history-lock on top of this.
      nav("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page-wrapper">
      <div className="login-card">

        {/* Brand mark */}
        <div className="login-brand">
          <div className="login-brand-dot" />
          <span className="login-brand-name">MosIC Office</span>
          <div className="login-brand-dot" />
        </div>

        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to continue to your workspace</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <div className="login-footer">
        <div className="login-divider">MosIC Office</div>
      </div>

      </div>
    </div>
  );
}
