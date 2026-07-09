import type { Config } from "tailwindcss";

import preset from "@viacerta/design-tokens/tailwind-preset";

export default {
  content: ["./src/**/*.{ts,tsx}", "./.storybook/**/*.{ts,tsx}"],
  presets: [preset],
} satisfies Config;
