# 12 — Visualization

> Charts and data viz live in two places:
>
> 1. **Domain components** in `packages/ui/src/viacerta/` — score gauge, dimension bars, flag badge — shared across both apps
> 2. **Feature-specific** in `apps/*/src/features/*/` — ROI chart, GCRI heatmap — closer to where they're used
>
> Everything uses Recharts (already pinned in `docs/02`); no D3 raw, no chart.js, no Plotly.

## Score gauge (already in `docs/03-design-system.md` — recapped here for completeness)

Half-donut SVG, 0–100 score, color tone follows GCSS flag. Used on portal dashboard and advisor assessment tab.

```tsx
// packages/ui/src/viacerta/ScoreGauge.tsx
type Props = { value: number; size?: number; thickness?: number }

export function ScoreGauge({ value, size = 160, thickness = 18 }: Props) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  const circ = Math.PI * radius                          // half circle circumference
  const dash = (clamped / 100) * circ
  const tone = colorForScore(clamped)
  const flagLabel = labelForScore(clamped)

  return (
    <svg
      width={size}
      height={size / 2 + thickness}
      viewBox={`0 0 ${size} ${size / 2 + thickness}`}
      role="img"
      aria-label={`Score ${clamped} out of 100, ${flagLabel}`}
    >
      <path
        d={`M ${thickness / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - thickness / 2} ${cy}`}
        fill="none"
        stroke="var(--vc-color-gray-200)"
        strokeWidth={thickness}
        strokeLinecap="round"
      />
      <path
        d={`M ${thickness / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - thickness / 2} ${cy}`}
        fill="none"
        stroke={tone}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
      />
      <text
        x={cx} y={cy - 6}
        textAnchor="middle"
        className="fill-gray-900"
        style={{ font: '700 28px var(--vc-font-display)' }}
      >
        {Math.round(clamped)}
      </text>
      <text
        x={cx} y={cy + 18}
        textAnchor="middle"
        className="fill-gray-500"
        style={{ font: '500 11px var(--vc-font-text)', letterSpacing: '0.05em' }}
      >
        / 100
      </text>
    </svg>
  )
}

function colorForScore(v: number) {
  if (v >= 80) return 'var(--vc-color-flag-green-solid)'
  if (v >= 60) return 'var(--vc-color-flag-yellow-solid)'
  if (v >= 40) return 'var(--vc-color-flag-red-solid)'
  return 'var(--vc-color-flag-declined-solid)'
}
function labelForScore(v: number) {
  if (v >= 80) return 'green'
  if (v >= 60) return 'yellow'
  if (v >= 40) return 'red'
  return 'declined'
}
```

## DimensionBar (already in `docs/03`; consumed by report + assessment views)

Horizontal bar; color tone derived from `score / max`. Includes optional advisor insight blurb.

```tsx
// packages/ui/src/viacerta/DimensionBar.tsx
type Props = {
  label: string
  score: number    // raw, e.g. 18
  max: number      // e.g. 20
  summary?: string | null
}

export function DimensionBar({ label, score, max, summary }: Props) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100))
  const tone = pct >= 80 ? 'green' : pct >= 60 ? 'yellow' : pct >= 40 ? 'red' : 'declined'
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm tabular-nums text-gray-600">
          {score.toFixed(1)} / {max}
        </span>
      </div>
      <div
        className="mt-1 h-2 w-full rounded-full bg-gray-100"
        role="progressbar"
        aria-valuenow={Math.round(score)}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className="h-2 rounded-full"
          style={{ width: `${pct}%`, background: `var(--vc-color-flag-${tone}-solid)` }}
        />
      </div>
      {summary && <p className="mt-2 text-sm text-gray-700">{summary}</p>}
    </div>
  )
}
```

## GCRI per-country heatmap

Used in advisor GCRI tab as compact overview. Each country × factor cell tinted by score.

```tsx
// apps/advisor/src/features/gcri/GcriHeatmap.tsx
import type { GcriResult } from '@viacerta/api-client/advisor'

type Props = { results: GcriResult[] }

const FACTOR_ORDER = [
  'JOB_MARKET_DEMAND', 'VISA_SUSTAINABILITY', 'SALARY_ROI', 'CAREER_CEILING',
  'COMPETITION_SATURATION', 'ECONOMIC_POLITICAL_STABILITY', 'SKILL_GAP_DIFFICULTY',
] as const

export function GcriHeatmap({ results }: Props) {
  if (results.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white px-2 py-2 text-left font-medium text-gray-600">
              Country
            </th>
            {FACTOR_ORDER.map((f) => (
              <th key={f} className="px-2 py-2 text-left font-medium text-gray-600">
                {factorLabel(f)}
              </th>
            ))}
            <th className="px-2 py-2 text-right font-medium text-gray-600">Final</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.country}>
              <td className="sticky left-0 z-10 bg-white px-2 py-2 font-medium">
                {r.country}
              </td>
              {FACTOR_ORDER.map((f) => {
                const fs = r.factorScores.find((x) => x.factor === f)
                if (!fs) return <td key={f} className="px-2 py-2 text-gray-300">—</td>
                const pct = fs.weighted / fs.max
                return (
                  <td
                    key={f}
                    className="px-2 py-2 text-center font-mono"
                    style={{ background: cellColor(pct), color: pct < 0.4 ? '#fff' : '#1a1a1a' }}
                    title={`${fs.weighted.toFixed(1)} / ${fs.max} · ${fs.dataPoints} data points`}
                  >
                    {fs.weighted.toFixed(0)}
                  </td>
                )
              })}
              <td
                className="px-2 py-2 text-right font-semibold"
                style={{ color: scoreColor(r.finalScore) }}
              >
                {r.finalScore.toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function cellColor(pct: number) {
  // 0 → red, 0.5 → yellow, 1 → green; linear blend
  if (pct >= 0.75) return 'rgba(22, 163, 74, 0.85)'   // green
  if (pct >= 0.55) return 'rgba(132, 204, 22, 0.55)'  // light green
  if (pct >= 0.35) return 'rgba(234, 179, 8, 0.55)'   // yellow
  if (pct >= 0.15) return 'rgba(249, 115, 22, 0.55)'  // orange
  return 'rgba(220, 38, 38, 0.75)'                    // red
}
function scoreColor(score: number) {
  if (score >= 75) return 'var(--vc-color-flag-green-solid)'
  if (score >= 55) return 'var(--vc-color-flag-yellow-solid)'
  if (score >= 35) return 'var(--vc-color-flag-red-solid)'
  return 'var(--vc-color-flag-declined-solid)'
}
function factorLabel(f: string) {
  return f.split('_').map((w) => w[0] + w.slice(1).toLowerCase()).join(' ')
}
```

## ROI chart (5-year salary projection vs total cost)

Recharts line chart, two lines (cost line static at total program cost; salary line projecting year-by-year). Break-even point highlighted.

```tsx
// apps/portal/src/features/report/RoiChart.tsx
// also used in apps/advisor/src/features/report/RoiChart.tsx via shared feature
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer,
} from 'recharts'

export type RoiSeries = {
  totalProgramCost: number          // INR, lakhs
  currency: string                  // "INR" or destination currency
  years: { year: number; cumulativeSalary: number }[]
  breakEvenYear: number | null
}

export function RoiChart({ data }: { data: RoiSeries }) {
  if (!data || data.years.length === 0) return null

  // Combine cost flat line + salary growth
  const merged = data.years.map((y) => ({
    year: `Y${y.year}`,
    cost: data.totalProgramCost,
    salary: y.cumulativeSalary,
  }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={merged} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--vc-color-gray-100)" />
          <XAxis dataKey="year" stroke="var(--vc-color-gray-500)" />
          <YAxis
            stroke="var(--vc-color-gray-500)"
            tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
          />
          <Tooltip
            formatter={(v: number) => `₹${(v / 100000).toFixed(1)}L`}
            contentStyle={{
              border: '1px solid var(--vc-color-gray-200)',
              borderRadius: 6, background: '#fff',
            }}
          />
          <Legend />
          <Line
            type="monotone" dataKey="cost"
            name="Total program cost"
            stroke="var(--vc-color-gray-500)"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            type="monotone" dataKey="salary"
            name="Cumulative salary"
            stroke="var(--vc-color-navy-600)"
            strokeWidth={2.5}
          />
          {data.breakEvenYear !== null && (
            <ReferenceLine
              x={`Y${data.breakEvenYear}`}
              stroke="var(--vc-color-flag-green-solid)"
              strokeDasharray="3 3"
              label={{
                value: 'Break-even', position: 'top',
                fill: 'var(--vc-color-flag-green-solid)', fontSize: 11,
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-2 text-xs text-gray-500">
        Salary projection assumes destination-country medians for this career vertical;
        actual outcomes vary. Currency: {data.currency}.
      </p>
    </div>
  )
}
```

## Journey timeline

Linear progress component for portal dashboard.

```tsx
// apps/portal/src/features/journey/JourneyTimeline.tsx
import { Check, Circle, Dot } from 'lucide-react'

const STAGES = [
  { code: 'LEAD',             label: 'Sign up' },
  { code: 'INTAKE_COMPLETE',  label: 'Intake' },
  { code: 'AI_PRESCORED',     label: 'AI pre-score' },
  { code: 'GCSS_CONFIRMED',   label: 'Session 1' },
  { code: 'GCRI_RUN',         label: 'Country risk' },
  { code: 'REPORT_BUILT',     label: 'Report' },
  { code: 'SESSION2_DONE',    label: 'Session 2' },
] as const

const ORDER: Record<string, number> = Object.fromEntries(STAGES.map((s, i) => [s.code, i]))

export function JourneyTimeline({ current, history }: { current: string; history: string[] }) {
  const reached = new Set(history)
  const currentIdx = ORDER[current] ?? 0

  return (
    <ol className="flex items-center justify-between overflow-x-auto py-2">
      {STAGES.map((s, i) => {
        const isDone = reached.has(s.code) && i < currentIdx
        const isActive = i === currentIdx
        return (
          <li key={s.code} className="flex flex-1 items-center">
            <div className="flex flex-col items-center text-center">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                isDone ? 'bg-navy-600 text-white'
                : isActive ? 'border-2 border-navy-600 bg-white text-navy-700'
                : 'border border-gray-300 bg-white text-gray-400'
              }`}>
                {isDone ? <Check className="h-3.5 w-3.5" /> :
                 isActive ? <Dot className="h-5 w-5" /> : <Circle className="h-2 w-2" />}
              </div>
              <span className={`mt-1 text-[10px] uppercase tracking-wide ${
                isActive ? 'font-semibold text-navy-700' : 'text-gray-500'
              }`}>
                {s.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`mx-2 h-0.5 flex-1 ${
                isDone ? 'bg-navy-600' : 'bg-gray-200'
              }`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
```

## Color tokens used

All chart colors come from `packages/design-tokens` and are exposed as CSS custom properties:

```css
/* defined in @viacerta/design-tokens */
:root {
  --vc-color-navy-600: #2c3e75;
  --vc-color-gray-100: #f3f4f6;
  --vc-color-gray-200: #e5e7eb;
  --vc-color-gray-500: #6b7280;
  --vc-color-flag-green-solid:   #16a34a;
  --vc-color-flag-yellow-solid:  #eab308;
  --vc-color-flag-red-solid:     #dc2626;
  --vc-color-flag-declined-solid:#71717a;
}
```

Never hardcode hex values inside chart components. Tokens make a theme swap one file.

## Accessibility

- Every chart has a `role="img"` wrapper with descriptive `aria-label` summarising the data ("Score 76 out of 100, yellow").
- Recharts is configured with `accessibilityLayer` (Recharts v2.10+) — handles keyboard nav across data points.
- Color is never the sole carrier of meaning: numerical values + textual labels always accompany color in dimension bars, heatmap cells, flag badges.
- Heatmap cell text colors flip to white on darker reds to maintain 4.5:1 contrast.

## What we explicitly are NOT building

| Asked for / tempting | Why not |
|---|---|
| Interactive radar / spider chart for GCSS dimensions | Hard to read precisely; horizontal bars are clearer for 5 dimensions |
| 3D country globe with GCRI overlay | Vanity; doesn't help advisors decide |
| Animated transitions on chart entry | Distracting in a decision tool; minimal motion only (Recharts default) |
| Live websocket-driven gauge | Polling is enough at MVP scale (see `docs/06`) |
| Sparklines for "score over time" | Each assessment is a new immutable doc; no time series view in MVP |
