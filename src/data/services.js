export const services = [
  {
    slug: "ic-design-asic-development",
    icon: "IC",
    title: "IC Design & ASIC Development",
    summary:
      "Full custom IC design using Cadence Virtuoso, from architecture and schematic through layout, verification, and tape-out support.",
    tags: ["Cadence Virtuoso", "DRC/LVS", "Tape-Out"],
    hasDetails: true,
    detail: {
      intro:
        "We deliver production-focused IC and ASIC programs with a complete silicon workflow, covering design, verification, layout closure, and foundry handoff.",
      featureList: [
        "End-to-end analog and mixed-signal IC design flow.",
        "Block-level and top-level architecture definition.",
        "Schematic design with reusable, reviewable design collateral.",
        "Design for manufacturability and process-node-aware optimization.",
      ],
      deliverablesList: [
        "Architecture and block specification package.",
        "Schematic database with simulation setup and test benches.",
        "Layout database with sign-off reports.",
        "Tape-out package and foundry handoff documentation.",
      ],
      toolsList: [
        "Cadence Virtuoso",
        "Spectre",
        "Calibre DRC/LVS/PEX",
        "Process design kits (PDKs)",
      ],
    },
  },
  {
    slug: "analog-mixed-signal-ip",
    icon: "AMS",
    title: "Analog & Mixed-Signal IP",
    summary:
      "Design of precision analog front-ends and mixed-signal IP blocks for instrumentation-grade performance and robust field reliability.",
    tags: ["ADC/DAC", "PLL", "Op-Amps"],
    hasDetails: true,
    detail: {
      intro:
        "Our analog and mixed-signal IP services focus on low-noise, high-linearity circuits built for demanding sensing and control systems.",
      featureList: [
        "Low-noise analog front-end and sensor interface design.",
        "Precision references, amplifiers, filters, and conditioning chains.",
        "Mixed-signal integration with calibration-friendly architectures.",
        "Design tradeoff optimization for power, noise, and area targets.",
      ],
      deliverablesList: [
        "IP functional specification and performance targets.",
        "Pre-layout and post-layout simulation sign-off reports.",
        "PVT and corner validation data.",
        "Integration notes for system and SoC teams.",
      ],
      toolsList: [
        "Cadence Virtuoso/Spectre",
        "Monte Carlo and mismatch analysis flows",
        "Behavioral models for system co-simulation",
        "Calibration and trim planning workflows",
      ],
    },
  },
  {
    slug: "pcb-design-integration",
    icon: "PCB",
    title: "PCB Design & Integration",
    summary:
      "High-performance PCB design for sensitive measurement systems with clean power, controlled routing, and manufacturable layouts.",
    tags: ["Altium", "Multi-Layer", "High-Freq"],
    hasDetails: true,
    detail: {
      intro:
        "We build robust PCB platforms that complement custom IC performance, with a focus on signal integrity, EMC discipline, and reliable production transfer.",
      featureList: [
        "Multi-layer PCB architecture for analog and mixed-signal systems.",
        "Low-noise grounding and partitioning strategies.",
        "High-speed and high-frequency routing best practices.",
        "Design reviews focused on manufacturing and test readiness.",
      ],
      deliverablesList: [
        "Schematic and annotated design documentation.",
        "PCB layout package and fabrication outputs.",
        "BOM, assembly drawings, and revision control data.",
        "Bring-up checklist and validation guidance.",
      ],
      toolsList: [
        "Altium Designer",
        "Signal and power integrity review tools",
        "DFM/DFT checklist workflows",
        "Manufacturing handoff packages",
      ],
    },
  },
  {
    slug: "device-gui-control-systems",
    icon: "GUI",
    title: "Device GUI & Control Systems",
    summary:
      "Custom GUI applications to configure, monitor, and control devices across mobile and desktop platforms for lab and field deployments.",
    tags: ["Mobile", "Desktop", "Real-Time"],
    hasDetails: true,
    detail: {
      intro:
        "We develop reliable control interfaces that connect hardware teams and operators with clear telemetry, configuration, and diagnostics workflows.",
      featureList: [
        "Cross-platform UI design for instrumentation control.",
        "Live telemetry dashboards with trend and event views.",
        "Parameter configuration with role-based safeguards.",
        "Protocol-aware integration with embedded firmware.",
      ],
      deliverablesList: [
        "UI/UX flow and interaction specification.",
        "Production-ready application binaries and source.",
        "Communication protocol integration layer.",
        "Deployment and operator documentation.",
      ],
      toolsList: [
        "Cross-platform desktop/mobile frameworks",
        "Serial/I2C/SPI/Ethernet integration adapters",
        "Data logging and diagnostics modules",
        "Versioned release and support workflows",
      ],
    },
  },
  {
    slug: "radiation-medical-sensors",
    icon: "RAD",
    title: "Radiation & Medical Sensors",
    summary:
      "Specialized IC and PCB engineering for radiation sensing and medical signal acquisition where fidelity and long-term stability are critical.",
    tags: ["Bio-Signals", "Radiation", "Safety"],
    hasDetails: true,
    detail: {
      intro:
        "Our domain-focused engineering supports high-fidelity sensing chains for radiation and biomedical applications with strict performance targets.",
      featureList: [
        "Sensor interface chains optimized for low-level signals.",
        "Noise-aware front-end and filtering strategy definition.",
        "Long-duration stability and drift-conscious design.",
        "System-level integration for acquisition and monitoring.",
      ],
      deliverablesList: [
        "Sensor front-end architecture and interface specification.",
        "Validation matrix for sensitivity and stability targets.",
        "Electronics integration package for embedded teams.",
        "Qualification support notes for field deployment.",
      ],
      toolsList: [
        "Precision analog design and simulation flows",
        "Lab measurement and characterization procedures",
        "Calibration and compensation methodologies",
        "Reliability-oriented design review checklists",
      ],
    },
  },
  {
    slug: "product-support-obsolescence",
    icon: "EOL",
    title: "Product Support & Obsolescence",
    summary:
      "Long-term lifecycle support for integrated products, including redesign, drop-in replacements, and compatibility-preserving upgrades.",
    tags: ["EOL", "Drop-In Replace", "Support"],
    hasDetails: true,
    detail: {
      intro:
        "We help teams extend product life with structured obsolescence management, sustaining engineering, and controlled migration strategies.",
      featureList: [
        "Obsolescence risk assessment and mitigation planning.",
        "Drop-in compatible redesign for legacy constraints.",
        "Component replacement and lifecycle continuity support.",
        "Backwards-compatible enhancement planning and execution.",
      ],
      deliverablesList: [
        "Lifecycle status and impact assessment reports.",
        "Replacement strategy with technical and schedule options.",
        "Updated design package with compatibility documentation.",
        "Validation checklist for migration and release readiness.",
      ],
      toolsList: [
        "Lifecycle and BOM risk analysis workflows",
        "Compatibility test and regression methods",
        "Sustaining engineering change documentation",
        "Long-term support planning templates",
      ],
    },
  },
];

export function getServiceBySlug(slug) {
  return services.find((service) => service.slug === slug);
}
