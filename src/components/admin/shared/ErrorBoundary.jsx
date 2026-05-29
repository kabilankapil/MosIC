import { Component } from "react";

/**
 * ErrorBoundary
 * Wraps each admin tab so a runtime crash in one tab
 * doesn't blank the entire dashboard.
 *
 * key={activeMenu} in Admin.jsx ensures this resets
 * automatically when the user switches to a different tab.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Unknown error" };
  }

  componentDidCatch(error, info) {
    // You can log to a service here later (e.g. Sentry)
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          height:         "60vh",
          gap:            16,
          color:          "var(--color-text)",
        }}>
          <span style={{ fontSize: 40 }}>⚠️</span>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            Something went wrong in this tab
          </h2>
          <p style={{ fontSize: "0.85rem", opacity: 0.6, maxWidth: 380, textAlign: "center" }}>
            {this.state.message}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              marginTop:    8,
              padding:      "8px 20px",
              borderRadius: 8,
              border:       "1px solid var(--color-border, #ccc)",
              background:   "transparent",
              cursor:       "pointer",
              fontSize:     "0.9rem",
              color:        "var(--color-text)",
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}