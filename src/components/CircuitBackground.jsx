import { useEffect } from "react";
import "./circuitBackground.css";

export default function CircuitBackground() {
  useEffect(() => {
    const createCircuitTraces = () => {
      const container = document.body;
      // Ultra minimal - only 6-8 traces
      const traceCount = 8;

      for (let i = 0; i < traceCount; i++) {
        const trace = document.createElement("div");
        trace.className = "circuit-trace";

        // Random scattered positions
        const x = Math.random() * 100;
        const y = Math.random() * 100;

        trace.style.left = `${x}%`;
        trace.style.top = `${y}%`;

        // Random animation delay
        const delay = Math.random() * 8;
        trace.style.animationDelay = `${delay}s`;

        container.appendChild(trace);
      }

      // Cleanup on unmount
      const handleCleanup = () => {
        const traces = document.querySelectorAll(".circuit-trace");
        traces.forEach(t => t.remove());
      };

      return () => {
        window.removeEventListener("beforeunload", handleCleanup);
      };
    };

    createCircuitTraces();
  }, []);

  return null;
}
