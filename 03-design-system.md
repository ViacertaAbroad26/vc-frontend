# 03 — Design System

> Tokens live in `@viacerta/design-tokens`. Tailwind preset exposes them as utility classes. Primitives in `@viacerta/ui` reference tokens, not raw values.

## Design principles

1. **Decision-tool, not consumer app**. Hierarchy serves comprehension, not engagement.
2. **Trust over delight**. Neutral backgrounds, restrained accents. The data should command attention.
3. **Same primitives across both apps**. Portal feels lighter; advisor feels denser; both look like the same product.
4. **Mobile-considerate, desktop-first**. Advisor console assumes ≥1280px. Portal works at 360px+ but design first at 1024px.

## Color palette

Brand axis: **trustworthy navy**, **warm amber accent**, semantic colors for flags. No purple, no neon.

### `packages/design-tokens/src/colors.ts`

```ts
export const colors = {
  // Brand
  navy: {
    50:  "#f0f4f9",
    100: "#dbe5f0",
    200: "#b8cce2",
    300: "#90aecd",
    400: "#5f86b1",
    500: "#3d6694",
    600: "#2d4f78",
    700: "#243f60",   // primary brand
    800: "#1c3149",
    900: "#152334",
  },
  amber: {
    50:  "#fef9ec",
    100: "#fbf0c8",
    200: "#f7e08e",
    300: "#f1c952",
    400: "#e9af2c",   // accent
    500: "#d39214",
    600: "#a96e10",
    700: "#7f5210",
    800: "#553609",
    900: "#2c1c04",
  },

  // Neutral grays (slightly cool)
  gray: {
    50:  "#f7f8fa",
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
    green:   { bg: "#dcfce7", text: "#166534", border: "#86efac", solid: "#16a34a" },
    yellow:  { bg: "#fef3c7", text: "#854d0e", border: "#fcd34d", solid: "#ca8a04" },
    red:     { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5", solid: "#dc2626" },
    gray:    { bg: "#f3f4f6", text: "#374151", border: "#d1d5db", solid: "#6b7280" },  // DECLINED
  },

  // Surface
  bg:        "#ffffff",
  bgMuted:   "#f7f8fa",
  bgRaised:  "#ffffff",
  border:    "#dde1ea",
  borderStrong: "#bec5d3",
} as const;

// Flag mapping
export type GcssFlag = "GREEN" | "YELLOW" | "RED" | "DECLINED";
export const flagColors: Record<GcssFlag, typeof colors.flag.green> = {
  GREEN:    colors.flag.green,
  YELLOW:   colors.flag.yellow,
  RED:      colors.flag.red,
  DECLINED: colors.flag.gray,
};

// Risk bands (GCRI)
export type RiskBand = "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";
export const riskBandColors: Record<RiskBand, typeof colors.flag.green> = {
  LOW:        colors.flag.green,
  MODERATE:   colors.flag.yellow,
  HIGH:       colors.flag.red,
  VERY_HIGH:  colors.flag.red,   // same red, stronger visual via solid badge
};
```

## Typography

System fonts. No web-font loading penalty. Inter as a fallback if installed locally.

```ts
// packages/design-tokens/src/typography.ts
export const typography = {
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont',
           '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
    mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
  },
  fontSize: {
    xs:   ["0.75rem",  { lineHeight: "1rem" }],     // 12 / 16
    sm:   ["0.875rem", { lineHeight: "1.25rem" }],  // 14 / 20
    base: ["1rem",     { lineHeight: "1.5rem" }],   // 16 / 24
    lg:   ["1.125rem", { lineHeight: "1.75rem" }],  // 18 / 28
    xl:   ["1.25rem",  { lineHeight: "1.75rem" }],  // 20 / 28
    "2xl": ["1.5rem",  { lineHeight: "2rem" }],     // 24 / 32
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30 / 36 — section heads
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }],   // 36 / 40 — page titles
    "5xl": ["3rem",    { lineHeight: "1" }],        // 48 — GCSS score number
    "6xl": ["3.75rem", { lineHeight: "1" }],        // 60 — gauge centerpiece
  },
  fontWeight: {
    normal:    "400",
    medium:    "500",
    semibold:  "600",
    bold:      "700",
  },
} as const;
```

### Type scale usage

| Element | Class |
|---|---|
| Page title | `text-3xl font-semibold tracking-tight` |
| Section heading | `text-xl font-semibold` |
| Subsection | `text-base font-semibold` |
| Body | `text-base` |
| Helper text | `text-sm text-gray-600` |
| Caption / label | `text-xs uppercase tracking-wide font-medium text-gray-500` |
| GCSS score (hero) | `text-6xl font-bold` |
| Code / monospace | `font-mono text-sm` |

## Spacing

4px scale (Tailwind default). Section vertical rhythm: 32 / 48 / 64.

| Token | px |
|---|---|
| `space-1` | 4 |
| `space-2` | 8 |
| `space-3` | 12 |
| `space-4` | 16 |
| `space-6` | 24 |
| `space-8` | 32 |
| `space-12` | 48 |
| `space-16` | 64 |

## Border radius

```ts
// packages/design-tokens/src/radius.ts
export const radius = {
  none: "0",
  sm: "0.25rem",   // 4px — inputs
  md: "0.375rem",  // 6px — buttons
  lg: "0.5rem",    // 8px — cards
  xl: "0.75rem",   // 12px — dialogs
  "2xl": "1rem",   // 16px
  full: "9999px",  // pills, avatars
};
```

## Shadows

Restrained. We use elevation sparingly because raised cards on a white background read better than shadows.

```ts
export const shadows = {
  sm:  "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md:  "0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
  lg:  "0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
  xl:  "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)",
};
```

## Tailwind preset

```ts
// packages/design-tokens/src/tailwind-preset.ts
import type { Config } from "tailwindcss";
import { colors } from "./colors";
import { typography } from "./typography";
import { radius } from "./radius";
import { shadows } from "./shadows";

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        navy: colors.navy,
        amber: colors.amber,
        gray: colors.gray,
        flag: {
          "green-bg":   colors.flag.green.bg,
          "green-text": colors.flag.green.text,
          "green-solid": colors.flag.green.solid,
          "yellow-bg":  colors.flag.yellow.bg,
          "yellow-text": colors.flag.yellow.text,
          "yellow-solid": colors.flag.yellow.solid,
          "red-bg":     colors.flag.red.bg,
          "red-text":   colors.flag.red.text,
          "red-solid":  colors.flag.red.solid,
        },
        // Map "primary" to navy.700 for shadcn-style usage
        primary: { DEFAULT: colors.navy[700], foreground: "#ffffff" },
        accent:  { DEFAULT: colors.amber[400], foreground: colors.gray[900] },
        muted:   { DEFAULT: colors.gray[100], foreground: colors.gray[600] },
        border:  colors.border,
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
```

## Primitive components

All built on **Radix UI** for accessibility + Tailwind for styling. shadcn/ui-style — copy + own, don't depend on a UI lib that updates underneath.

### Button — `packages/ui/src/primitives/Button.tsx`

```tsx
import { type ButtonHTMLAttributes, type Ref, forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const VARIANTS = {
  primary:   "bg-navy-700 text-white hover:bg-navy-800 focus-visible:ring-navy-500",
  secondary: "bg-white text-navy-700 border border-navy-200 hover:bg-navy-50 focus-visible:ring-navy-300",
  ghost:     "bg-transparent text-navy-700 hover:bg-navy-50 focus-visible:ring-navy-300",
  destructive: "bg-flag-red-solid text-white hover:bg-red-700 focus-visible:ring-red-400",
  outline:   "bg-transparent text-navy-700 border border-navy-300 hover:bg-navy-50",
} as const;

const SIZES = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
  fullWidth?: boolean;
};

export const Button = forwardRef(function Button(
  { className, variant = "primary", size = "md", loading, fullWidth, disabled, children, ...rest }: ButtonProps,
  ref: Ref<HTMLButtonElement>,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={twMerge(clsx(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        VARIANTS[variant], SIZES[size],
        fullWidth && "w-full",
        className,
      ))}
      {...rest}
    >
      {loading && <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
});
```

### Input — `packages/ui/src/primitives/Input.tsx`

```tsx
import { type InputHTMLAttributes, type Ref, forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const Input = forwardRef(function Input(
  { className, error, ...rest }: InputProps,
  ref: Ref<HTMLInputElement>,
) {
  return (
    <input
      ref={ref}
      className={twMerge(clsx(
        "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm",
        "placeholder:text-gray-400",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error ? "border-flag-red-solid focus-visible:ring-red-400" : "border-gray-300",
        className,
      ))}
      {...rest}
    />
  );
});
```

### Card — `packages/ui/src/primitives/Card.tsx`

```tsx
import type { HTMLAttributes, PropsWithChildren } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement> & PropsWithChildren) {
  return (
    <div
      className={twMerge(clsx("rounded-lg border border-gray-200 bg-white shadow-sm", className))}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement> & PropsWithChildren) {
  return (
    <div className={twMerge(clsx("border-b border-gray-100 px-6 py-4", className))} {...rest}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement> & PropsWithChildren) {
  return <div className={twMerge(clsx("p-6", className))} {...rest}>{children}</div>;
}

export function CardFooter({ className, children, ...rest }: HTMLAttributes<HTMLDivElement> & PropsWithChildren) {
  return (
    <div className={twMerge(clsx("border-t border-gray-100 px-6 py-4", className))} {...rest}>
      {children}
    </div>
  );
}
```

## Domain components

### GcssFlagBadge — `packages/ui/src/viacerta/GcssFlagBadge.tsx`

```tsx
import { type GcssFlag } from "@viacerta/design-tokens";

const STYLES: Record<GcssFlag, { className: string; label: string }> = {
  GREEN: {
    className: "bg-flag-green-bg text-flag-green-text border-green-200",
    label: "Ready",
  },
  YELLOW: {
    className: "bg-flag-yellow-bg text-flag-yellow-text border-amber-200",
    label: "Ready with Plan",
  },
  RED: {
    className: "bg-flag-red-bg text-flag-red-text border-red-200",
    label: "Not Yet Ready",
  },
  DECLINED: {
    className: "bg-gray-100 text-gray-700 border-gray-200",
    label: "Refer to Prep Resources",
  },
};

export function GcssFlagBadge({ flag, size = "md" }: { flag: GcssFlag; size?: "sm" | "md" | "lg" }) {
  const s = STYLES[flag];
  const sizeCls = size === "sm" ? "text-xs px-2 py-0.5"
                : size === "lg" ? "text-base px-4 py-1.5"
                : "text-sm px-3 py-1";
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${sizeCls} ${s.className}`}>
      {s.label}
    </span>
  );
}
```

### ScoreGauge — `packages/ui/src/viacerta/ScoreGauge.tsx`

Half-donut SVG; the big number on the report.

```tsx
import { type GcssFlag, flagColors } from "@viacerta/design-tokens";

type Props = {
  score: number;             // 0..100
  flag: GcssFlag;
  max?: number;              // default 100
  label?: string;
};

export function ScoreGauge({ score, flag, max = 100, label = "GCSS" }: Props) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));
  const angle = (pct / 100) * 180;
  const radius = 80;
  const cx = 100, cy = 100;
  const startX = cx - radius, startY = cy;
  const endRad = (Math.PI * (180 - angle)) / 180;
  const endX = cx + radius * Math.cos(endRad);
  const endY = cy - radius * Math.sin(endRad);
  const largeArc = angle > 180 ? 1 : 0;
  const arcPath = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`;
  const color = flagColors[flag].solid;

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="120" viewBox="0 0 200 120" role="img" aria-label={`${label} ${score} of ${max}`}>
        <path d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
              fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round" />
        <path d={arcPath} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
        <text x={cx} y={cy - 8} textAnchor="middle" className="fill-gray-900" fontSize="40" fontWeight="700">
          {Math.round(score)}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="fill-gray-500" fontSize="12">
          / {max}
        </text>
      </svg>
      <div className="mt-2 text-xs uppercase tracking-wide text-gray-500">{label}</div>
    </div>
  );
}
```

### DimensionBar — `packages/ui/src/viacerta/DimensionBar.tsx`

```tsx
type Props = {
  label: string;
  score: number;
  max: number;
  flag?: "GREEN" | "YELLOW" | "RED" | "GRAY";
};

const TRACK = {
  GREEN: "bg-flag-green-solid",
  YELLOW: "bg-flag-yellow-solid",
  RED: "bg-flag-red-solid",
  GRAY: "bg-gray-400",
};

export function DimensionBar({ label, score, max, flag }: Props) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));
  const tone = flag ?? (pct >= 80 ? "GREEN" : pct >= 60 ? "YELLOW" : pct >= 40 ? "RED" : "GRAY");
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-gray-900">{label}</span>
        <span className="tabular-nums text-gray-600">
          {score} <span className="text-gray-400">/ {max}</span>
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div className={`h-full rounded-full transition-all ${TRACK[tone]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
```

### ReportDisclaimer — `packages/ui/src/viacerta/ReportDisclaimer.tsx`

```tsx
import { Info } from "lucide-react";

export function ReportDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-gray-50 border border-gray-200 p-4">
      <Info className="h-5 w-5 mt-0.5 text-gray-500 shrink-0" aria-hidden />
      <p className="text-sm text-gray-600">
        This report predicts probability, not certainty. Outcomes depend on Stage-7 execution
        and external factors outside any consultancy's control. ViaCerta does not earn
        commissions from universities; recommendations are career-first.
      </p>
    </div>
  );
}
```

## Accessibility

- All interactive primitives ship with focus rings (`focus-visible:ring-*`).
- Form fields always have associated `<Label>` via Radix `<LabelPrimitive.Root>`.
- Dialogs/Drawers come from Radix → keyboard + screen-reader behaviour for free.
- Color contrast for primary text on background ≥ AA (navy-700 on white = 11.5:1).
- Flag colors carry text labels — never communicate state by color alone.
- The score gauge has a `role="img"` and `aria-label`.

## Iconography

`lucide-react`. Strict palette: `text-gray-500` for utility, `text-navy-700` for actions, semantic colors for state. Default size 16px (inline) / 20px (button) / 24px (page-level).

## Component preview index

| Primitive | File | Used by |
|---|---|---|
| Button | `primitives/Button.tsx` | everywhere |
| Input, Textarea, Select | `primitives/Input.tsx` etc | forms |
| Card | `primitives/Card.tsx` | layout |
| Dialog | `primitives/Dialog.tsx` (Radix wrapper) | overrides, GCRI run, confirm, parent-link request |
| Drawer | `primitives/Drawer.tsx` | mobile nav, advisor side panels |
| Tabs | `primitives/Tabs.tsx` | advisor: intake / docs / audit; report: sections |
| Accordion | `primitives/Accordion.tsx` | progressive disclosure on report sub-scores |
| Table | `primitives/Table.tsx` | case queue, leads, audit log |
| Toast | `primitives/Toast.tsx` (Radix) | mutation feedback |
| **GcssFlagBadge** | `viacerta/GcssFlagBadge.tsx` | report, case queue, dashboard |
| **ScoreGauge** | `viacerta/ScoreGauge.tsx` | report header, advisor assessment header |
| **DimensionBar** | `viacerta/DimensionBar.tsx` | GCSS section, GCRI factor breakdown |
| **EvidenceLevelBadge** | `viacerta/EvidenceLevelBadge.tsx` | advisor documents panel, audit trail |
| **RiskBandPill** | `viacerta/RiskBandPill.tsx` | GCRI country cards |
| **ReportDisclaimer** | `viacerta/ReportDisclaimer.tsx` | every report view |
