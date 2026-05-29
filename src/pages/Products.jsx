import { useState } from "react";
import "./products.css";

const products = [
  {
    id: "mic1008",
    name: "MIC1008",
    subtitle: "LVDT Signal Conditioner",
    tag: "Signal Conditioning IC",
    description:
      "The MIC1008 is a high-precision LVDT/RVDT signal conditioner IC designed for industrial measurement and position sensing applications. It integrates excitation, demodulation, and digital readout in a single chip.",
    features: [
      "Digital Readout of Ratiometric output",
      "No extra passive components are required",
      "Readout for monitoring line faults",
      "Insensitive to transformer null voltage",
      "Internally compensated for primary and secondary phase shifts",
      "Support 4-wire or 5-wire LVDT/RVDT",
      "Programmable channel gain",
      "Configuration of the chip using I2C serial interface",
    ],
    specs: [
      { label: "Operating Temp", value: "−40 to +125 °C" },
      { label: "Package", value: "56 Pin SSOP" },
      { label: "Interface", value: "I2C Serial" },
      { label: "Input Type", value: "4-wire / 5-wire LVDT/RVDT" },
    ],
    status: "Active",
  },
];

export default function Products() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="products-page">
      <div className="products-layout">
        {/* Left Panel */}
        <aside className="products-sidebar">
          <div className="sidebar-label">Products</div>
          <div className="product-list">
            {products.map((p) => (
              <button
                key={p.id}
                className={`product-btn ${selected?.id === p.id ? "active" : ""}`}
                onClick={() => setSelected(p)}
              >
                <span className="product-btn-icon">⬡</span>
                <span className="product-btn-text">
                  <span className="product-btn-name">{p.name}</span>
                  <span className="product-btn-sub">{p.subtitle}</span>
                </span>
                <span className="product-btn-arrow">›</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Right Panel */}
        <main className="products-main">
          {selected ? (
            <div className="product-detail" key={selected.id}>
              {/* Header */}
              <div className="detail-header">
                <div className="detail-header-left">
                  <span className="detail-tag">{selected.tag}</span>
                  <h1 className="detail-name">{selected.name}</h1>
                  <p className="detail-subtitle">{selected.subtitle}</p>
                </div>
                <span className={`detail-status ${selected.status === "Active" ? "active" : ""}`}>
                  ● {selected.status}
                </span>
              </div>

              {/* Description */}
              <p className="detail-description">{selected.description}</p>

              {/* Specs strip */}
              <div className="spec-strip">
                {selected.specs.map((s) => (
                  <div className="spec-item" key={s.label}>
                    <span className="spec-label">{s.label}</span>
                    <span className="spec-value">{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="features-section">
                <h2 className="features-title">Key Features</h2>
                <ul className="features-list">
                  {selected.features.map((f, i) => (
                    <li key={i} className="feature-item" style={{ animationDelay: `${i * 60}ms` }}>
                      <span className="feature-dot"></span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <div className="no-selection-icon">⬡</div>
              <p>Select a product to view its specifications</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
