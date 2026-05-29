// ── Stocks.jsx ────────────────────────────────────────────────────────────────
import { useState } from "react";
import StockItemsTab     from "./stocks/StockItemsTab";
import StockMovementsTab from "./stocks/StockMovementsTab";

export default function Stocks({ role }) {
  const [tab, setTab] = useState("items");

  const tabBtn = (id, label) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      style={{
        padding:    "7px 18px",
        borderRadius: 8,
        border:     tab === id ? "1.5px solid var(--a-teal)"    : "1.5px solid var(--a-teal-20)",
        background: tab === id ? "var(--a-teal-10)"              : "transparent",
        color:      tab === id ? "var(--a-teal)"                 : "var(--a-text-muted)",
        fontWeight: tab === id ? 700                             : 500,
        fontSize:   "0.85rem",
        cursor:     "pointer",
        transition: "all 0.15s ease",
      }}>
      {label}
    </button>
  );

  return (
    <div className="content-section">
      <div className="activity-header" style={{ marginBottom: 14 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700, color: "var(--a-teal)" }}>
            📦 Stocks
          </h1>
          <p style={{ margin: "3px 0 0", fontSize: "0.74rem", color: "var(--a-text-muted)" }}>
            Catalog and movement tracking for inventory
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {tabBtn("items",     "🗂️ Stock Items")}
          {tabBtn("movements", "📈 Movements")}
        </div>
      </div>

      <div style={{ borderBottom: "1px solid var(--a-teal-20)", marginBottom: 20 }} />

      {tab === "items"
        ? <StockItemsTab     role={role} />
        : <StockMovementsTab role={role} />
      }
    </div>
  );
}