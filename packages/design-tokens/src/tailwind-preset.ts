import type { Config } from "tailwindcss";

import { colors } from "./colors";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { typography } from "./typography";

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        navy: colors.navy,
        mint: colors.mint,
        linen: colors.linen,
        coffee: colors.coffee,
        amber: colors.amber,
        gray: colors.gray,
        flag: {
          "green-bg": colors.flag.green.bg,
          "green-text": colors.flag.green.text,
          "green-solid": colors.flag.green.solid,
          "yellow-bg": colors.flag.yellow.bg,
          "yellow-text": colors.flag.yellow.text,
          "yellow-solid": colors.flag.yellow.solid,
          "red-bg": colors.flag.red.bg,
          "red-text": colors.flag.red.text,
          "red-solid": colors.flag.red.solid,
        },
        // Map "primary" to navy.700 (Yale Blue) for shadcn-style usage
        primary: { DEFAULT: colors.navy[700], foreground: "#ffffff" },
        // Map "accent" to mint.400 (Mint Leaf) for shadcn-style usage
        accent: { DEFAULT: colors.mint[400], foreground: colors.navy[900] },
        muted: { DEFAULT: colors.gray[100], foreground: colors.gray[600] },
        border: colors.border,
      },
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      borderRadius: radius,
      boxShadow: shadows,
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.5rem",
          lg: "2rem",
        },
      },
    },
  },
};

export default preset;
