export const typography = {
  fontFamily: {
    // Primary font (brand guidelines: Poppins, semi-bold) — body copy & UI
    sans: [
      "Poppins",
      "ui-sans-serif",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ],
    // Secondary font (brand guidelines: Montserrat, semi-bold) — headings & display
    heading: [
      "Montserrat",
      "ui-sans-serif",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ],
    mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
  },
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }], // 12 / 16
    sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14 / 20
    base: ["1rem", { lineHeight: "1.5rem" }], // 16 / 24
    lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18 / 28
    xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20 / 28
    "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24 / 32
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30 / 36 — section heads
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36 / 40 — page titles
    "5xl": ["3rem", { lineHeight: "1" }], // 48 — GCSS score number
    "6xl": ["3.75rem", { lineHeight: "1" }], // 60 — gauge centerpiece
  } as Record<string, [string, { lineHeight: string }]>,
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
};
