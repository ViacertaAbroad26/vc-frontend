import type { Config } from "tailwindcss";

import preset from "@viacerta/design-tokens/tailwind-preset";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [preset],
} satisfies Config;
