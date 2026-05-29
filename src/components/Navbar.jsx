import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/useTheme";
import logo from "../images/mosics.png";
import "./navbar.css";

const NAV_LINKS = [
  { id: "home", label: "HOME", path: "/" },
  {
    id: "products",
    label: "PRODUCTS",
    children: [
      { label: "MIC1008 – LVDT Signal Conditioning",   path: "/products/mic1008" },
      { label: "MIC1027 – Capacitive Measurement ROIC", path: "/products/mic1027" },
    ],
  },
  {
    id: "services",
    label: "SERVICES",
    children: [
      { label: "IC Design & ASIC Development",       path: "/services/ic-design-asic-development" },
      { label: "Analog & Mixed-Signal IP",            path: "/services/analog-mixed-signal-ip" },
      { label: "PCB Design & Integration",            path: "/services/pcb-design-integration" },
      { label: "Device GUI & Control Systems",        path: "/services/device-gui-control-systems" },
      { label: "Radiation & Medical Sensors",         path: "/services/radiation-medical-sensors" },
      { label: "Product Support & Obsolescence",      path: "/services/product-support-obsolescence" },
    ],
  },
  { id: "contact", label: "CONTACT US", path: "/contact" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const location = useLocation();
  const navRef   = useRef(null);

  /* Close dropdown on outside click (desktop) */
  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  /* Close everything on route change */
  useEffect(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
  }, [location.pathname]);

  /* Prevent body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isMobile = () => window.innerWidth <= 700;

  const isActive = (item) => {
    if (item.children) return item.children.some((c) => location.pathname === c.path);
    if (item.path === "/") return location.pathname === "/";
    return location.pathname === item.path;
  };

  const handleDropdownToggle = (id) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  /* On desktop: open on hover; on mobile: open on click (toggle) */
  const handleMouseEnter = (item) => {
    if (!isMobile() && item.children) setOpenDropdown(item.id);
  };

  const handleMouseLeave = (item) => {
    if (!isMobile() && item.children) setOpenDropdown(null);
  };

  return (
    <header className="site-header" ref={navRef}>

      {/* ══════════ TOP BAR ══════════ */}
      <div className="header-topbar">
        <div className="header-inner">

          <Link to="/" className="header-logo-wrap" aria-label="MosIC Solutions home">
            <img src={logo} alt="MosIC Solutions" className="header-logo" />
          </Link>

          <div className="header-divider" aria-hidden="true" />

          <div className="header-brand-text">
            <span className="header-tagline">
              Precision IC Design &amp; Mixed-Signal Solutions
            </span>
          </div>

          <div className="header-actions">
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* ══════════ NAV BAR ══════════ */}
      <nav className="header-navbar" aria-label="Main navigation">
        <div className="header-inner">

          {/* Hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="main-nav-list"
          >
            <span className={`hamburger-line ${mobileOpen ? "line-1-open" : ""}`} />
            <span className={`hamburger-line ${mobileOpen ? "line-2-open" : ""}`} />
            <span className={`hamburger-line ${mobileOpen ? "line-3-open" : ""}`} />
          </button>

          {/* Nav links */}
          <ul
            id="main-nav-list"
            className={`nav-list ${mobileOpen ? "nav-list-open" : ""}`}
            role="menubar"
          >
            {NAV_LINKS.map((item) => (
              <li
                key={item.id}
                className={`nav-item ${openDropdown === item.id ? "dropdown-open" : ""}`}
                onMouseEnter={() => handleMouseEnter(item)}
                onMouseLeave={() => handleMouseLeave(item)}
                role="none"
              >
                {item.path && !item.children ? (
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive(item) ? "nav-link-active" : ""}`}
                    role="menuitem"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    className={`nav-link nav-link-btn ${isActive(item) ? "nav-link-active" : ""}`}
                    onClick={() => handleDropdownToggle(item.id)}
                    aria-expanded={openDropdown === item.id}
                    aria-haspopup="true"
                    role="menuitem"
                  >
                    {item.label}
                    <svg
                      className="nav-chevron"
                      width="9" height="7"
                      viewBox="0 0 10 8"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 2l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}

                {item.children && openDropdown === item.id && (
                  <ul className="nav-dropdown" role="menu">
                    {item.children.map((child) => (
                      <li key={child.path} role="none">
                        <Link
                          to={child.path}
                          className={`nav-dropdown-link ${
                            location.pathname === child.path ? "dropdown-link-active" : ""
                          }`}
                          role="menuitem"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          {/* Sign In */}
          <Link to="/login" className="signin-btn">
            Sign In
          </Link>

        </div>
      </nav>

    </header>
  );
}
