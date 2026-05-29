import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
// Adjust these import paths to match your project structure:
import { products } from "../data/products";
import { services } from "../data/services";
import "./home.css";

/* ── Hero slides ── */
const HERO_SLIDES = [
  {
    id: 1,
    badge: "Flagship Product",
    title: "MIC1008",
    subtitle: "Single-Chip LVDT Signal Conditioning",
    description:
      "Complete readout IC for LVDT/RVDT signal conditioning with robust fault monitoring, programmable gain, and minimal external components.",
    cta: { label: "View Product", path: "/products/mic1008" },
    bgClass: "slide-bg-teal",
    ctaClass: "cta-teal",
    image: "/images/mic1008.jpg",
  },
  {
    id: 2,
    badge: "Flagship Product",
    title: "MIC1027",
    subtitle: "High-Resolution Capacitive Sensing ROIC",
    description:
      "Differential capacitance measurement IC with 16-bit digital output, self-calibrating offset compensation, and I²C configuration interface.",
    cta: { label: "View Product", path: "/products/mic1027" },
    bgClass: "slide-bg-pink",
    ctaClass: "cta-pink",
    image: null,
  },
  {
    id: 3,
    badge: "End-to-End Engineering",
    title: "IC Design Services",
    subtitle: "From Architecture to Tape-Out",
    description:
      "Full custom IC design, analog & mixed-signal IP, PCB integration, and embedded GUI solutions — all under one roof in Bengaluru.",
    cta: { label: "Explore Services", path: "/services/ic-design-asic-development" },
    bgClass: "slide-bg-blue",
    ctaClass: "cta-blue",
    image: null,
  },
];

/* ── Category tiles below hero ── */
const CATEGORY_TILES = [
  {
    id: "products",
    label: "PRODUCTS",
    description: "Precision signal-conditioning ICs",
    path: "/products/mic1008",
    accentColor: "#ff2d78",
    bgClass: "tile-bg-products",
  },
  {
    id: "services",
    label: "SERVICES",
    description: "Full-stack IC & PCB design services",
    path: "/services/ic-design-asic-development",
    accentColor: "#00e5c3",
    bgClass: "tile-bg-services",
  },
  {
    id: "about",
    label: "ABOUT US",
    description: "Bengaluru-based precision electronics",
    path: "/contact",
    accentColor: "#1a6fff",
    bgClass: "tile-bg-about",
  },
  {
    id: "contact",
    label: "CONTACT",
    description: "Talk to our engineering team",
    path: "/contact",
    accentColor: "#9b4dff",
    bgClass: "tile-bg-contact",
  },
];

/* ── Company stats ── */
const STATS = [
  { value: "2+",   label: "Products" },
  { value: "6+",   label: "Services" },
  { value: "10+",  label: "Yrs Experience" },
  { value: "100%", label: "Precision" },
];

/* ── Swipe threshold in px ── */
const SWIPE_THRESHOLD = 50;

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const timerRef    = useRef(null);
  const touchStart  = useRef(null);
  const touchEnd    = useRef(null);
  const isDragging  = useRef(false);

  /* ── Auto-advance ── */
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setActiveSlide((s) => (s + 1) % HERO_SLIDES.length),
      5500
    );
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  /* ── Navigation helpers (restart timer on manual nav) ── */
  const goTo = useCallback((i) => {
    setActiveSlide(i);
    startTimer();
  }, [startTimer]);

  const prev = useCallback(() => {
    setActiveSlide((s) => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    startTimer();
  }, [startTimer]);

  const next = useCallback(() => {
    setActiveSlide((s) => (s + 1) % HERO_SLIDES.length);
    startTimer();
  }, [startTimer]);

  /* ── Touch / swipe handlers ── */
  const onTouchStart = (e) => {
    touchStart.current = e.targetTouches[0].clientX;
    touchEnd.current   = null;
    isDragging.current = false;
  };

  const onTouchMove = (e) => {
    touchEnd.current   = e.targetTouches[0].clientX;
    isDragging.current = true;
  };

  const onTouchEnd = () => {
    if (!isDragging.current || touchStart.current === null || touchEnd.current === null) return;
    const delta = touchStart.current - touchEnd.current;
    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      delta > 0 ? next() : prev();
    }
    touchStart.current = null;
    touchEnd.current   = null;
    isDragging.current = false;
  };

  /* ── Mouse drag (desktop) ── */
  const mouseStart = useRef(null);

  const onMouseDown = (e) => {
    mouseStart.current = e.clientX;
  };

  const onMouseUp = (e) => {
    if (mouseStart.current === null) return;
    const delta = mouseStart.current - e.clientX;
    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      delta > 0 ? next() : prev();
    }
    mouseStart.current = null;
  };

  return (
    <div className="home-page">

      {/* ══════════ HERO CAROUSEL ══════════ */}
      <section
        className="hero-carousel"
        aria-label="Featured content"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            className={`carousel-slide ${i === activeSlide ? "slide-active" : ""}`}
            aria-hidden={i !== activeSlide}
          >
            {!slide.image && <div className={`slide-bg ${slide.bgClass}`} />}

            {slide.image && (
              <img
                src={slide.image}
                alt={slide.title}
                className="slide-full-img"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
                draggable={false}
              />
            )}

            <div className="slide-circuit-overlay" />
            <div className="slide-photo-overlay" />

            <div className="slide-content">
              <span className="slide-badge">{slide.badge}</span>
              <h1 className="slide-title">{slide.title}</h1>
              <p className="slide-subtitle">{slide.subtitle}</p>
              <p className="slide-desc">{slide.description}</p>
              <Link
                to={slide.cta.path}
                className={`slide-cta ${slide.ctaClass}`}
                draggable={false}
              >
                {slide.cta.label} →
              </Link>
            </div>
          </div>
        ))}

        {/* Prev / Next */}
        <button className="carousel-btn carousel-prev" onClick={prev} aria-label="Previous slide">‹</button>
        <button className="carousel-btn carousel-next" onClick={next} aria-label="Next slide">›</button>

        {/* Dots */}
        <div className="carousel-dots" role="tablist" aria-label="Slides">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot ${i === activeSlide ? "dot-active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              role="tab"
              aria-selected={i === activeSlide}
            />
          ))}
        </div>
      </section>

      {/* ══════════ CATEGORY TILES ══════════ */}
      <section className="category-tiles" aria-label="Navigation tiles">
        {CATEGORY_TILES.map((tile) => (
          <Link key={tile.id} to={tile.path} className="category-tile">
            <div className={`tile-bg ${tile.bgClass}`} />
            <div className="tile-hover-wash" style={{ "--tile-accent": tile.accentColor }} />
            <div className="tile-content">
              <span className="tile-label" style={{ background: tile.accentColor }}>
                {tile.label}
              </span>
              <p className="tile-desc">{tile.description}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* ══════════ ABOUT ══════════ */}
      <section className="home-about">
        <div className="about-inner">
          <div className="about-text">
            <span className="section-eyebrow">WHO WE ARE</span>
            <h2>Precision Mixed-Signal IC Design</h2>
            <p>
              MosIC Solutions is a Bengaluru-based electronics company specialising in custom
              integrated circuit design, analog &amp; mixed-signal IP, and end-to-end ASIC development.
              We deliver production-grade silicon for industrial sensing, instrumentation, and
              precision measurement applications.
            </p>
            <Link to="/contact" className="about-cta">Get In Touch →</Link>
          </div>

          <div className="about-stats">
            {STATS.map((s) => (
              <div key={s.label} className="stat-item">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PRODUCTS ══════════ */}
      <section className="home-products">
        <div className="section-inner">
          <span className="section-eyebrow">OUR PRODUCTS</span>
          <h2>Signal Conditioning ICs</h2>
          <div className="product-cards">
            {products.map((p) => (
              <Link key={p.slug} to={`/products/${p.slug}`} className="product-preview-card">
                <div className="card-code">{p.code}</div>
                <h3 className="card-title">{p.title}</h3>
                <p className="card-summary">{p.summary}</p>
                <div className="card-tags">
                  {p.tags.slice(0, 3).map((t) => (
                    <span key={t} className="card-tag">{t}</span>
                  ))}
                </div>
                <span className="card-link">View Details →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SERVICES ══════════ */}
      <section className="home-services">
        <div className="section-inner">
          <span className="section-eyebrow">OUR SERVICES</span>
          <h2>Engineering Capabilities</h2>
          <div className="service-cards">
            {services.slice(0, 4).map((s) => (
              <Link key={s.slug} to={`/services/${s.slug}`} className="service-preview-card">
                <div className="service-icon-badge">{s.icon}</div>
                <h3 className="card-title">{s.title}</h3>
                <p className="card-summary">{s.summary}</p>
                <span className="card-link">Learn More →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CONTACT CTA ══════════ */}
      <section className="home-contact-cta">
        <div className="cta-inner">
          <h2>Ready to Start Your Next IC Project?</h2>
          <p>Our engineering team is ready to discuss your design requirements and deliver production-grade solutions.</p>
          <Link to="/contact" className="cta-btn">Contact Our Engineers →</Link>
        </div>
      </section>

    </div>
  );
}
