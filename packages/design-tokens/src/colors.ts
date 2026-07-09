export const colors = {
  // Brand — "Yale Blue" (primary, #044e77) per ViaCerta brand guidelines (March 2026)
  navy: {
    50: "#eaf2f6",
    100: "#cfe2eb",
    200: "#a3c8d9",
    300: "#6fa8c2",
    400: "#3d85a8",
    500: "#1d6a8d",
    600: "#0a5a7d",
    700: "#044e77", // primary brand — Yale Blue
    800: "#033e60",
    900: "#022c44",
  },
  // Brand — "Mint Leaf" (secondary, #68b687) — CTAs, highlights, success accents
  mint: {
    50: "#f1f9f4",
    100: "#ddf0e3",
    200: "#bfe2cb",
    300: "#98d0ac",
    400: "#68b687", // secondary brand — Mint Leaf
    500: "#4a9d6c",
    600: "#3a8059",
    700: "#2d6446",
    800: "#214a34",
    900: "#163224",
  },
  // Brand — "Soft Linen" (background, #f1efe4) — warm neutral surfaces
  linen: {
    50: "#fdfcf9",
    100: "#f1efe4", // background brand — Soft Linen
    200: "#e6e2d1",
    300: "#d6d0b8",
    400: "#bfb697",
  },
  // Brand — "Dark Coffee" (accent, #342312) — grounded text/footer accents
  coffee: {
    400: "#5a4128",
    500: "#46311c",
    600: "#342312", // accent brand — Dark Coffee
    700: "#241809",
  },
  amber: {
    50: "#fef9ec",
    100: "#fbf0c8",
    200: "#f7e08e",
    300: "#f1c952",
    400: "#e9af2c", // accent
    500: "#d39214",
    600: "#a96e10",
    700: "#7f5210",
    800: "#553609",
    900: "#2c1c04",
  },

  // Neutral grays (slightly cool)
  gray: {
    50: "#f7f8fa",
    100: "#eef0f4",
    200: "#dde1ea",
    300: "#bec5d3",
    400: "#8d97aa",
    500: "#646e83",
    600: "#4a5266",
    700: "#363c4d",
    800: "#22273a",
    900: "#11141e",
  },

  // Semantic flag colors (GCSS + GCRI risk bands)
  flag: {
    green: { bg: "#dcfce7", text: "#166534", border: "#86efac", solid: "#16a34a" },
    yellow: { bg: "#fef3c7", text: "#854d0e", border: "#fcd34d", solid: "#ca8a04" },
    red: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5", solid: "#dc2626" },
    gray: { bg: "#f3f4f6", text: "#374151", border: "#d1d5db", solid: "#6b7280" }, // DECLINED
  },

  // Surface
  bg: "#ffffff",
  bgMuted: "#f7f8fa",
  bgRaised: "#ffffff",
  border: "#dde1ea",
  borderStrong: "#bec5d3",
} as const;

// Flag mapping
export type GcssFlag = "GREEN" | "YELLOW" | "RED" | "DECLINED";
export type FlagColorSet = { bg: string; text: string; border: string; solid: string };
export const flagColors: Record<GcssFlag, FlagColorSet> = {
  GREEN: colors.flag.green,
  YELLOW: colors.flag.yellow,
  RED: colors.flag.red,
  DECLINED: colors.flag.gray,
};

// Risk bands (GCRI)
export type RiskBand = "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";
export const riskBandColors: Record<RiskBand, FlagColorSet> = {
  LOW: colors.flag.green,
  MODERATE: colors.flag.yellow,
  HIGH: colors.flag.red,
  VERY_HIGH: colors.flag.red, // same red, stronger visual via solid badge
};
