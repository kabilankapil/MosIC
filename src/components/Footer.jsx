import { Link } from "react-router-dom";
// Adjust path to match your project:
import { SITE_CONTACT } from "../data/siteContact";
import logo from "../images/mosics.png";
import "./footer.css";

const FOOTER_LINKS = [
  {
    heading: "PRODUCTS",
    links: [
      { label: "MIC1008 – LVDT Signal Conditioning",   path: "/products/mic1008" },
      { label: "MIC1027 – Capacitive Measurement ROIC", path: "/products/mic1027" },
    ],
  },
  {
    heading: "SERVICES",
    links: [
      { label: "IC Design & ASIC Development",    path: "/services/ic-design-asic-development" },
      { label: "Analog & Mixed-Signal IP",         path: "/services/analog-mixed-signal-ip" },
      { label: "PCB Design & Integration",         path: "/services/pcb-design-integration" },
      { label: "Device GUI & Control Systems",     path: "/services/device-gui-control-systems" },
      { label: "Radiation & Medical Sensors",      path: "/services/radiation-medical-sensors" },
      { label: "Product Support & Obsolescence",   path: "/services/product-support-obsolescence" },
    ],
  },
  {
    heading: "CONTACT US",
    isContact: true,
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      {/* ── Top 4-tile image strip (mirrors Data Patterns) ── */}
      <div className="footer-tiles">
        <Link to="/products/mic1008" className="ftile ftile-products">
          <div className="ftile-bg" />
          <span className="ftile-label" style={{ background: "#ff2d78" }}>PRODUCTS</span>
        </Link>
        <Link to="/services/ic-design-asic-development" className="ftile ftile-services">
          <div className="ftile-bg" />
          <span className="ftile-label" style={{ background: "#00a896" }}>SERVICES</span>
        </Link>
        <Link to="/contact" className="ftile ftile-about">
          <div className="ftile-bg" />
          <span className="ftile-label" style={{ background: "#1a6fff" }}>ABOUT US</span>
        </Link>
        <Link to="/contact" className="ftile ftile-contact">
          <div className="ftile-bg" />
          <span className="ftile-label" style={{ background: "#7b2fff" }}>SUPPORT</span>
        </Link>
      </div>

      {/* ── Multi-column link section ── */}
      <div className="footer-body">
        <div className="footer-inner">

          {/* Brand column */}
          <div className="footer-brand">
            {/* Replace with your actual logo path */}
            <img src={logo} alt="MosIC Solutions" className="footer-logo" />
            <p className="footer-brand-tagline">
              Precision Mixed-Signal<br />IC Design &amp; ASIC Solutions
            </p>
            <address className="footer-address">
              {SITE_CONTACT.addressLines.map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </address>
            <div className="footer-contact-links">
              <a href={SITE_CONTACT.phoneHref} className="footer-contact-link">
                {/* Phone icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                {SITE_CONTACT.phoneDisplay}
              </a>
              <a href={SITE_CONTACT.emailHref} className="footer-contact-link">
                {/* Email icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {SITE_CONTACT.email}
              </a>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading} className="footer-col">
              <h4 className="footer-col-heading">{col.heading}</h4>
              {col.isContact ? (
                <div className="footer-contact-col">
                  <p className="footer-addr-short">
                    {SITE_CONTACT.addressLines[0]}<br />
                    {SITE_CONTACT.addressLines[1]}<br />
                    {SITE_CONTACT.addressLines[2]}
                  </p>
                  <a href={SITE_CONTACT.phoneHref}  className="footer-link">{SITE_CONTACT.phoneDisplay}</a>
                  <a href={SITE_CONTACT.emailHref}  className="footer-link">{SITE_CONTACT.email}</a>
                  <Link to="/contact" className="footer-cta-link">Send a Message →</Link>
                </div>
              ) : (
                <ul className="footer-link-list">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.path} className="footer-link">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} MosIC Solutions Pvt. Ltd. All rights reserved.</p>
        <p>Bengaluru, Karnataka, India</p>
      </div>
    </footer>
  );
}
