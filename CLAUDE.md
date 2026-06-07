# CLAUDE.md — ViaCerta Frontend

> **For Claude Code**: read this first. Then read `docs/` in numeric order. This is a **pnpm monorepo** with two React apps (portal + advisor) and shared packages. Build the apps to consume the backend's two OpenAPI specs.

---

## Stack (non-negotiable)

| Layer | Choice |
|---|---|
| Package manager | pnpm 8+ (workspaces) |
| Build | Vite 5 |
| Language | TypeScript 5 (strict mode) |
| UI framework | React 18 |
| Routing | React Router 6 |
| Server state | TanStack Query v5 |
| Client state | Zustand |
| Forms | react-hook-form + zod |
| HTTP client | axios with interceptors |
| API types | openapi-typescript (generated from backend's OpenAPI specs) |
| Styling | Tailwind CSS 3 + shadcn/ui primitives |
| Charts | Recharts |
| Icons | lucide-react |
| Date | date-fns |
| Tests | Vitest + React Testing Library + MSW |
| E2E | Playwright |

Do not substitute. ADR-001..006 explain why.

---

## Two apps, not one

```
frontend/
├── apps/
│   ├── portal/      # student + parent  → consumes /openapi.json
│   └── advisor/     # advisor + internal → consumes /advisor/openapi.json
└── packages/
    ├── ui/          # shared component library (Button, Input, Card, …)
    ├── api-client/  # generated typed clients
    ├── design-tokens/  # colors, spacing, type scale
    └── utils/       # shared helpers (date, format, types)
```

**Why two apps**: audience separation enforced at the **build level**. The portal bundle literally cannot ship advisor-only types or components because they don't exist in its dependency graph. Same principle as the backend's separate OpenAPI specs.

---

## What this frontend does

1. **Portal** (`apps/portal`): student goes from sign-up → persona-routed intake → document upload → AI pre-score waiting state → report viewer → decision gate. Parent gets a slim summary view.
2. **Advisor** (`apps/advisor`): advisor sees case queue → student detail → assessment with overrides → confirm → trigger GCRI → write 6 insight blocks → publish report. Internal ops sees leads, documents to verify, data ops.
3. Both apps share components from `packages/ui` and a generated, typed API client from `packages/api-client`.

---

## Read order

1. `docs/00-context.md` — product context, audiences, what each app does
2. `docs/01-project-structure.md` — exact folder layout for both apps + packages
3. `docs/02-tech-stack.md` — package.json, vite.config, tsconfig
4. `docs/03-design-system.md` — colors, spacing, typography, component primitives
5. `docs/04-api-client.md` — OpenAPI codegen, axios wrapper, JWT refresh interceptor
6. `docs/05-auth-and-routing.md` — JWT storage, protected routes, role-based redirects
7. `docs/06-state-management.md` — TanStack Query patterns + Zustand stores
8. `docs/07-forms-and-validation.md` — react-hook-form + zod patterns, intake save-and-resume
9. `docs/08-student-portal.md` — every portal screen with component breakdown
10. `docs/09-parent-view.md` — parent-summary surface
11. `docs/10-advisor-console.md` — every advisor screen
12. `docs/11-internal-ops.md` — coordinator + ops screens
13. `docs/12-visualization.md` — GCSS gauge, dimension bars, GCRI heat map, ROI chart
14. `docs/13-testing.md` — Vitest + RTL + MSW + Playwright
15. `docs/14-deployment.md` — Vercel / CloudFront + S3
16. `docs/15-development-roadmap.md` — phasing
17. `adrs/*` — settled decisions, do not relitigate

---

## Non-negotiable rules

| Rule | Where enforced |
|---|---|
| Portal app never imports anything from advisor-only types | TypeScript build fails — `packages/api-client/portal` doesn't export advisor types |
| All API calls go through generated client in `@viacerta/api-client` | ESLint `no-restricted-imports` blocks raw `axios` outside the client package |
| All forms use react-hook-form + zod | Lint rule blocks `useState` for form fields beyond 1 field |
| All routes are protected by role except `/login` and `/register` | Router config in `apps/*/src/router.tsx` |
| JWT in memory + refresh token in httpOnly cookie OR localStorage with strict rotation | See `docs/05-auth-and-routing.md` |
| No advisor-only field names ever appear in portal app code | Generated types simply don't include them |
| Audience disclaimer always visible on every report view | `<ReportDisclaimer />` mounted in `<ReportLayout />` |
| Loading + error + empty states are mandatory for every async UI | Codified via the `<AsyncBoundary />` HOC |

---

## Project layout (Claude Code: create this exactly)

```
frontend/
├── CLAUDE.md
├── README.md
├── pnpm-workspace.yaml
├── package.json                       # root, scripts only
├── tsconfig.base.json
├── .prettierrc
├── .eslintrc.cjs
├── .nvmrc                             # 20
├── .gitignore
├── docs/
├── adrs/
│
├── apps/
│   ├── portal/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.cjs
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── router.tsx
│   │   │   ├── routes/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginPage.tsx
│   │   │   │   │   └── RegisterPage.tsx
│   │   │   │   ├── student/
│   │   │   │   │   ├── DashboardPage.tsx
│   │   │   │   │   ├── intake/
│   │   │   │   │   │   ├── IntakeStartPage.tsx
│   │   │   │   │   │   ├── IntakeFormPage.tsx
│   │   │   │   │   │   └── IntakeSubmitPage.tsx
│   │   │   │   │   ├── documents/
│   │   │   │   │   │   └── DocumentsPage.tsx
│   │   │   │   │   ├── pending/
│   │   │   │   │   │   └── AiPreScorePendingPage.tsx
│   │   │   │   │   ├── report/
│   │   │   │   │   │   ├── ReportPage.tsx
│   │   │   │   │   │   └── ReportPdfPage.tsx
│   │   │   │   │   ├── decision/
│   │   │   │   │   │   └── DecisionGatePage.tsx
│   │   │   │   │   └── journey/
│   │   │   │   │       └── JourneyPage.tsx
│   │   │   │   └── parent/
│   │   │   │       └── ParentSummaryPage.tsx
│   │   │   ├── features/                # one folder per domain feature
│   │   │   │   ├── auth/
│   │   │   │   ├── intake/
│   │   │   │   ├── documents/
│   │   │   │   ├── report/
│   │   │   │   ├── decision/
│   │   │   │   └── journey/
│   │   │   ├── components/              # app-specific components
│   │   │   │   ├── layout/
│   │   │   │   └── shared/
│   │   │   ├── hooks/
│   │   │   ├── stores/                  # zustand stores
│   │   │   │   ├── auth-store.ts
│   │   │   │   └── intake-store.ts
│   │   │   ├── lib/
│   │   │   │   ├── query-client.ts
│   │   │   │   └── env.ts
│   │   │   └── styles/
│   │   │       └── globals.css
│   │   └── tests/
│   │
│   └── advisor/
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── index.html
│       ├── tailwind.config.ts
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── router.tsx
│       │   ├── routes/
│       │   │   ├── auth/
│       │   │   ├── advisor/
│       │   │   │   ├── CaseQueuePage.tsx
│       │   │   │   ├── StudentDetailPage.tsx
│       │   │   │   ├── AssessmentPage.tsx
│       │   │   │   ├── GcriRunPage.tsx
│       │   │   │   ├── ReportBuilderPage.tsx
│       │   │   │   └── CalibrationPage.tsx
│       │   │   └── internal/
│       │   │       ├── LeadsPage.tsx
│       │   │       ├── DocumentVerifyPage.tsx
│       │   │       ├── DataOpsPage.tsx
│       │   │       └── OutcomesPage.tsx
│       │   ├── features/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── stores/
│       │   └── lib/
│       └── tests/
│
└── packages/
    ├── ui/                              # @viacerta/ui
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── src/
    │   │   ├── index.ts                 # barrel exports
    │   │   ├── primitives/
    │   │   │   ├── Button.tsx
    │   │   │   ├── Input.tsx
    │   │   │   ├── Textarea.tsx
    │   │   │   ├── Select.tsx
    │   │   │   ├── Checkbox.tsx
    │   │   │   ├── Radio.tsx
    │   │   │   ├── Card.tsx
    │   │   │   ├── Badge.tsx
    │   │   │   ├── Toast.tsx
    │   │   │   ├── Dialog.tsx
    │   │   │   ├── Drawer.tsx
    │   │   │   ├── Tabs.tsx
    │   │   │   ├── Accordion.tsx
    │   │   │   ├── Table.tsx
    │   │   │   └── Tooltip.tsx
    │   │   ├── feedback/
    │   │   │   ├── Spinner.tsx
    │   │   │   ├── Skeleton.tsx
    │   │   │   ├── ErrorState.tsx
    │   │   │   ├── EmptyState.tsx
    │   │   │   └── AsyncBoundary.tsx
    │   │   ├── layout/
    │   │   │   ├── PageHeader.tsx
    │   │   │   ├── Section.tsx
    │   │   │   └── Stack.tsx
    │   │   └── viacerta/                # domain components shared across apps
    │   │       ├── GcssFlag.tsx
    │   │       ├── RiskBandPill.tsx
    │   │       ├── ScoreGauge.tsx
    │   │       ├── EvidenceLevelBadge.tsx
    │   │       └── ReportDisclaimer.tsx
    │   └── tests/
    │
    ├── api-client/                      # @viacerta/api-client
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── src/
    │   │   ├── index.ts
    │   │   ├── portal.ts                # exports portalClient + portal types
    │   │   ├── advisor.ts               # exports advisorClient + advisor types
    │   │   ├── axios-instance.ts        # base axios with interceptors
    │   │   ├── auth-storage.ts          # token persistence
    │   │   ├── refresh-interceptor.ts
    │   │   ├── errors.ts                # ApiError, ValidationError, etc.
    │   │   └── generated/
    │   │       ├── portal.d.ts          # generated from /openapi.json
    │   │       └── advisor.d.ts         # generated from /advisor/openapi.json
    │   └── scripts/
    │       └── generate.ts              # runs openapi-typescript against backend
    │
    ├── design-tokens/                   # @viacerta/design-tokens
    │   ├── package.json
    │   ├── src/
    │   │   ├── index.ts
    │   │   ├── colors.ts                # navy/amber/green palette + flag semantics
    │   │   ├── typography.ts
    │   │   ├── spacing.ts
    │   │   └── tailwind-preset.ts       # exports Tailwind preset for both apps
    │   └── tests/
    │
    └── utils/                           # @viacerta/utils
        ├── package.json
        ├── src/
        │   ├── index.ts
        │   ├── format.ts                # currency (INR/EUR/USD), date, number
        │   ├── audience.ts              # FORBIDDEN_KEYS for dev-mode lint
        │   ├── flags.ts                 # GCSS flag → color, label, recommendation
        │   ├── routes.ts                # named routes for both apps
        │   └── types.ts
        └── tests/
```

---

## Patterns Claude Code must follow

### Pattern 1: pages are thin, features are smart

Each route file in `apps/*/src/routes/` is a wrapper. It imports a feature component and does nothing else.

```tsx
// apps/portal/src/routes/student/report/ReportPage.tsx
import { StudentReport } from "../../../features/report/StudentReport";

export default function ReportPage() {
  return <StudentReport />;
}
```

```tsx
// apps/portal/src/features/report/StudentReport.tsx
import { useStudentReport } from "./useStudentReport";
import { AsyncBoundary, ReportDisclaimer } from "@viacerta/ui";
import { ReportHeader, GcssSection, GcriSection, InsightsSection,
         RoiSection, RiskRegisterSection, NinetyDayPlanSection,
         ParentSummary } from "./components";

export function StudentReport() {
  const { data, isLoading, error } = useStudentReport();

  return (
    <AsyncBoundary isLoading={isLoading} error={error} data={data}>
      {(report) => (
        <article className="max-w-3xl mx-auto px-4 py-8 space-y-10">
          <ReportHeader report={report} />
          <GcssSection report={report} />
          <GcriSection report={report} />
          <InsightsSection insights={report.advisorInsights} />
          <RoiSection report={report} />
          <RiskRegisterSection items={report.riskRegister} />
          <NinetyDayPlanSection plan={report.ninetyDayPlan} />
          <ParentSummary summary={report.parentSummary} />
          <ReportDisclaimer />
        </article>
      )}
    </AsyncBoundary>
  );
}
```

### Pattern 2: data lives in TanStack Query hooks

One hook per resource. Naming: `use<Subject><Verb>`.

```tsx
// apps/portal/src/features/report/useStudentReport.ts
import { useQuery } from "@tanstack/react-query";
import { portalClient } from "@viacerta/api-client";

export function useStudentReport() {
  return useQuery({
    queryKey: ["studentReport", "latest"],
    queryFn: () => portalClient.GET("/api/v1/portal/students/me/report"),
    select: (r) => r.data,
    staleTime: 60_000,
  });
}
```

### Pattern 3: mutations always return a typed Promise + invalidate the right queries

```tsx
// apps/advisor/src/features/assessment/useGcssOverride.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { advisorClient } from "@viacerta/api-client";

export function useGcssOverride(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: GcssOverrideRequest) =>
      advisorClient.POST(
        "/api/v1/advisor/students/{student_id}/assessment/override",
        { params: { path: { student_id: studentId } }, body },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["advisor", "assessment", studentId] });
      qc.invalidateQueries({ queryKey: ["advisor", "cases"] });
    },
  });
}
```

### Pattern 4: forms use react-hook-form + zod, never raw useState

```tsx
// apps/advisor/src/features/assessment/OverrideDialog.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const Schema = z.object({
  newRaw: z.number().min(0).max(20),
  evidenceNote: z.string().min(10, "Evidence note must be at least 10 characters"),
});
type FormValues = z.infer<typeof Schema>;

export function OverrideDialog({ dimension, subKey, onSubmit }) {
  const { register, handleSubmit, formState: { errors, isValid } } =
    useForm<FormValues>({ resolver: zodResolver(Schema), mode: "onBlur" });
  // ...
}
```

### Pattern 5: GCSS/GCRI domain components are shared via `@viacerta/ui/viacerta`

```tsx
// packages/ui/src/viacerta/GcssFlag.tsx
import type { GcssFlag } from "@viacerta/utils";

const STYLES: Record<GcssFlag, { bg: string; text: string; label: string }> = {
  GREEN:    { bg: "bg-green-100",  text: "text-green-800",  label: "Ready" },
  YELLOW:   { bg: "bg-amber-100",  text: "text-amber-800",  label: "Ready with Plan" },
  RED:      { bg: "bg-red-100",    text: "text-red-800",    label: "Not Yet Ready" },
  DECLINED: { bg: "bg-gray-100",   text: "text-gray-800",   label: "Refer to Prep" },
};

export function GcssFlagBadge({ flag }: { flag: GcssFlag }) {
  const s = STYLES[flag];
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}
```

### Pattern 6: audience separation enforced by import

```tsx
// ❌ Won't compile in portal app — type doesn't exist
import type { AdvisorAssessmentResponse } from "@viacerta/api-client";

// ✅ Portal-allowed type
import type { StudentReportResponse } from "@viacerta/api-client";
```

The `@viacerta/api-client` package has separate entry points (`portal.ts`, `advisor.ts`). Portal `package.json` only depends on the portal entry. There's a Vite alias enforcing this.

---

## First task on a fresh repo (Claude Code: do these in order)

1. Initialize pnpm workspace: `pnpm init`, create `pnpm-workspace.yaml`.
2. Create root `tsconfig.base.json`, `.eslintrc.cjs`, `.prettierrc`.
3. Create `packages/design-tokens` — colors, spacing, Tailwind preset.
4. Create `packages/utils` — flags helper, formatters, route names, audience-leak dev guard.
5. Create `packages/api-client` — base axios + auth storage + refresh interceptor. Add `scripts/generate.ts` (runs against `http://localhost:8000/openapi.json` and `/advisor/openapi.json`).
6. Create `packages/ui` — primitives first (Button, Input, Card), then feedback (AsyncBoundary), then domain (GcssFlag, ScoreGauge).
7. Create `apps/portal`: Vite scaffold, Router, Login + Register pages, auth store.
8. Implement portal student flow page by page (intake → documents → pending → report → decision).
9. Create `apps/advisor`: same scaffold; implement case queue → student detail → assessment → confirm → GCRI → report builder.
10. Internal ops pages last.
11. Run `pnpm -r test` — everything green.

---

## When in doubt

- If two docs disagree, **this file wins**, but flag the disagreement.
- If a backend endpoint exists but isn't documented here, generate types and use it.
- If a backend endpoint doesn't exist for a UI need, **don't invent it** — open a question.
- Don't build screens that would need advisor-only fields in the portal app. If you find yourself reaching for an "advisor" type in the portal, stop — it's an architecture violation.
