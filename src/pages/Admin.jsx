import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/useTheme";
import {
  getCurrentUser,
  clearCurrentUser,
  
} from "../utils/userStore";
import ActivityLog   from "../components/admin/ActivityLog";
import UserManagement from "../components/admin/UserManagement";
import ContentManager from "../components/admin/ContentManager";
import Sales         from "../components/admin/Sales";
import Party         from "../components/admin/Party";
import Purchase      from "../components/admin/Purchase";
import Stocks        from "../components/admin/Stocks";
import Matpass       from "../components/admin/Matpass";
import { ToastProvider } from "../components/admin/shared/ToastContext";
import ErrorBoundary from "../components/admin/shared/ErrorBoundary";
import Employee      from "../components/admin/Employee";
import HR            from "../components/admin/HR";
import Dashboard from "../components/admin/Dashboard";
import "./admin.css";

const BASE_MENU = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "files",     label: "Files",     icon: "🗂️" },
  { id: "sales",     label: "Sales",     icon: "💰" },
  { id: "purchase",  label: "Purchase",  icon: "📈" },
  { id: "stocks",    label: "Stocks",    icon: "📦" },
  { id: "matpass",   label: "MAT Pass",  icon: "🪪" },
  { id: "party",     label: "Party",     icon: "📋" },
  { id: "hr",        label: "HR",        icon: "👥" },
  { id: "employee",  label: "Employee",  icon: "⚙️" },
];

const SUPER_MENU = { id: "users", label: "Users", icon: "👤" };

const roleBadge = {
  SUPER:  { bg: "#fef3c7", color: "#92400e" },
  ADMIN:  { bg: "#dbeafe", color: "#1e40af" },
  COMMON: { bg: "#f3f4f6", color: "#374151" },
};

export default function Admin() {
  const nav = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu]   = useState("dashboard");

  const currentUser = getCurrentUser();
  const role        = currentUser?.role || "COMMON";
  const menuItems   = role === "SUPER" ? [...BASE_MENU, SUPER_MENU] : BASE_MENU;
  const badge       = roleBadge[role] || roleBadge.COMMON;

  // ── Null guard: session expired or tampered with mid-use ────────────────────
  // AdminRoute prevents unauthenticated entry, but if the session disappears
  // while the user is already on this page (another tab cleared storage, etc.)
  // we catch it here and redirect rather than rendering a broken dashboard.
  useEffect(() => {
    if (!currentUser) {
      nav("/login", { replace: true });
    }
  }, [currentUser, nav]);

  if (!currentUser) return null; // prevent flash of broken UI during redirect

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    const wasSuper = role === "SUPER";

    clearCurrentUser(); // wipes sessionStorage: current_user + auth_token

    // If SUPER logs out, remove the shared backend token too.
    // Without this, local ADMIN/COMMON users would continue making API calls
    // with the stale SUPER JWT even after SUPER has ended their session.
    

    // ✅ Navigate to /login, not /.
    //    Going to "/" left /admin in the forward-history and relied entirely
    //    on AdminRoute to block re-entry. Being explicit here is safer and
    //    gives the user clear feedback that they have been signed out.
    nav("/login", { replace: true });
  };

  // ── Content renderer ────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <Dashboard currentUser={currentUser} />;

      case "files":    return <ActivityLog    role={role} />;
      case "party":    return <Party          role={role} />;
      case "sales":    return <Sales          role={role} />;
      case "purchase": return <Purchase       role={role} />;
      case "stocks":   return <Stocks         role={role} />;
      case "matpass":  return <Matpass        role={role} />;
      case "hr":       return <HR             role={role} />;
      case "employee": return <Employee       role={role} />;

      case "users":
        // Double-check role even though the sidebar only shows this item to SUPER.
        // Defence-in-depth: a tampered activeMenu value shouldn't expose UserManagement.
        return role === "SUPER"
          ? <UserManagement />
          : <div className="content-section"><p>Access denied.</p></div>;

      default:
        return null;
    }
  };

  const handleNavClick = (id) => {
    setActiveMenu(id);
    setMobileSidebarOpen(false); // close overlay on mobile after selection
  };

  return (
    <ToastProvider>
      <div className="admin-container">
        {/* Overlay backdrop — only visible on mobile when sidebar is open */}
        <div
          className={`sidebar-overlay${mobileSidebarOpen ? " visible" : ""}`}
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />

        <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}${mobileSidebarOpen ? " mobile-open" : ""}`}>
          <div className="sidebar-header">
            <h2 className={sidebarOpen ? "show" : "hide"}>Admin Panel</h2>
            {/* Desktop toggle ◀▶ */}
            <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? "◀" : "▶"}
            </button>
            {/* Mobile hamburger — shown only via CSS media query */}
            <button
              className="hamburger-btn"
              onClick={() => setMobileSidebarOpen((o) => !o)}
              aria-label={mobileSidebarOpen ? "Close menu" : "Open menu"}
              title="Menu"
            >
              {mobileSidebarOpen ? "✕" : "☰"}
            </button>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeMenu === item.id ? "active" : ""}`}
                onClick={() => handleNavClick(item.id)}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className={`nav-label ${sidebarOpen ? "show" : "hide"}`}>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <span className="nav-icon">🚪</span>
              <span className={`nav-label ${sidebarOpen ? "show" : "hide"}`}>Logout</span>
            </button>
          </div>
        </aside>

        <button
          onClick={toggleTheme}
          style={{
            position:   "fixed",
            top:        14,
            right:      18,
            zIndex:     9999,
            background: "transparent",
            border:     "none",
            cursor:     "pointer",
            color:      "var(--color-text)",
            display:    "flex",
            alignItems: "center",
            padding:    4,
          }}
          aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>

        <main className="admin-content" style={{ paddingTop: 40 }}>
         <ErrorBoundary key={activeMenu}>
    {renderContent()}
  </ErrorBoundary>
        </main>
      </div>
    </ToastProvider>
  );
}
