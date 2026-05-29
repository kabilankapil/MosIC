export const products = [
  {
    slug: "mic1008",
    code: "MIC1008",
    title: "Single Chip Solution for LVDT Signal Conditioning",
    subtitle: "Linear Variable Differential Transformer",
    summary:
      "Integrated readout IC for LVDT/RVDT signal conditioning with robust fault monitoring and minimal external components.",
    tags: [
      "Digital Output",
      "Programmable Gain",
      "SPI / I2C",
      "Fault Monitor",
    ],
    highlights: [
      "Digital readout of ratiometric output.",
      "No extra passive components required.",
      "Support for 4-wire or 5-wire LVDT/RVDT.",
      "I2C serial interface for chip configuration.",
    ],
    hasDetails: true,
    detail: {
      intro:
        "MIC1008 is a complete single-chip solution for LVDT/RVDT signal conditioning in precision instrumentation systems.",
      featureList: [
        "Digital readout of ratiometric output.",
        "No extra passive components are required.",
        "Readout support for monitoring line faults.",
        "Insensitive to transformer null voltage.",
        "Internally compensated for primary and secondary phase shifts.",
        "Support for 4-wire or 5-wire LVDT/RVDT.",
        "Programmable channel gain.",
        "Configuration of the chip using I2C serial interface.",
      ],
      specList: [
        "Operating temperature: -40 to 125 deg C.",
        "Package option: 56 Pin SSOP.",
      ],
    },
  },
  {
    slug: "mic1027",
    code: "MIC1027",
    title: "Readout Circuit for Capacitance Measurement",
    subtitle: "High-Resolution Capacitive Sensing",
    summary:
      "ROIC for differential capacitance measurement with differential analog output and 16-bit digital equivalent output.",
    tags: [
      "Differential Output",
      "16-bit Readout",
      "Offset Control",
      "I2C Config",
    ],
    highlights: [
      "Differential analog output.",
      "16-bit digital equivalent output.",
      "Self-calibrating zero-input offset compensation.",
      "I2C interface for configuration settings.",
    ],
    hasDetails: true,
    detail: {
      intro:
        "MIC1027 is a readout integrated circuit for differential capacitance measurements with analog and digital output options.",
      featureList: [
        "Differential analog output.",
        "16-bit digital equivalent output.",
        "Self-calibrating mode to compensate zero-input offset differential capacitance.",
        "I2C interface for configuration settings.",
      ],
      specList: [
        "Max average input capacitance: 30 pF.",
        "Operating temperature: -40 to 125 deg C.",
        "Package options: 56 Pin SSOP and bare silicon die without packaging.",
      ],
    },
  },
  //{
  //  slug: "heartbeat-sensor-ics",
  //  code: "MIC-HEART",
  //  title: "Heartbeat Sensor ICs",
  //  summary:
 //    "Low-noise analog front-end ICs for reliable heartbeat acquisition and wearable medical monitoring.",
   // highlights: [
  //    "Low-noise signal acquisition path.",
  //    "Designed for battery-powered wearable use cases.",
  //    "Stable operation across variable motion conditions.",
  //    "Production support available on request.",
  //  ],
  //  hasDetails: false,
  //},
 // {
   // slug: "radiation-detection-devices",
  //  code: "MIC-RAD",
   // title: "Radiation Detection Devices",
   // summary:
   //   "High-sensitivity mixed-signal devices for radiation event detection in industrial and research environments.",
   // highlights: [
   //   "High-sensitivity detection pipeline.",
   //   "Mixed-signal architecture for robust event capture.",
   //   "Designed for long-term reliability.",
   //   "Custom qualification options available.",
  //  ],
 //   hasDetails: false,
 // },
];

export function getProductBySlug(slug) {
  return products.find((product) => product.slug === slug);
}
