# CLAUDE.md — ViaCerta Frontend

> **For Claude Code**: read this first. Then read the numbered docs (`00-context.md` through `15-development-roadmap.md`) in order. This is a **pnpm monorepo** with a single React app (`apps/web`) and shared packages. The app consumes both of the backend's OpenAPI specs through one merged, generated API client. See [ADR-007](./ADR-007-single-app-merge.md) for why this is one app, not two.

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

## One app, role-based routing

```
frontend/
├── apps/
│   └── web/         # student + parent + advisor + internal — single deploy
└── packages/
    ├── ui/          # shared component library (Button, Input, Card, …)
    ├── api-client/  # single generated typed client (merged OpenAPI specs)
    ├── design-tokens/  # colors, spacing, type scale
    └── utils/       # shared helpers (date, format, types, AppRole, routes)
```

**One app, one build, one deploy** (see [ADR-007](./ADR-007-single-app-merge.md)). `apps/web` consumes both backend OpenAPI specs (`/openapi.json` and `/advisor/openapi.json`), merged at codegen time into a single `paths`/`components.schemas` type used by `@viacerta/api-client`.

Audience separation is enforced **at runtime**, not at the bundle level:

- `<ProtectedRoute>` gates everything except `/login` and `/register`.
- `<RoleGate allow={...}>` gates advisor and internal-ops routes by role.
- `<SideNav>` only renders nav items the current user's role can access.

The backend remains the actual security boundary — a STUDENT's JWT cannot call `/api/v1/advisor/*` regardless of what's in the frontend bundle. ADR-002 (now superseded) explains the build-level-isolation approach this replaced and why it was given up.

---

## What this frontend does

1. **Student/parent flow**: student goes from sign-up → persona-routed intake → document upload → AI pre-score waiting state → report viewer → decision gate. Parent gets a slim summary view at `/parent/students/:studentId`.
2. **Advisor/internal flow**: advisor sees case queue → student detail → assessment with overrides → confirm → trigger GCRI → write 6 insight blocks → publish report. Internal ops sees leads, documents to verify, data ops, outcomes, and user management — all role-gated within the same app.
3. Both flows share components from `packages/ui`, role types/routes from `packages/utils`, and the single generated, typed API client from `packages/api-client`. Landing route (`/`) redirects each user to the right surface via `destinationByRole(role, studentId)`.

---

## Read order

1. `docs/00-context.md` — product context, audiences, what each app does
2. `docs/01-project-structure.md` — exact folder layout for `apps/web` + packages
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
| Advisor/internal routes are gated by role at runtime | `<RoleGate allow={...}>` wrapping each advisor/internal route in `apps/web/src/router.tsx` |
| All API calls go through generated client in `@viacerta/api-client` | ESLint `no-restricted-imports` blocks raw `axios` outside the client package |
| All forms use react-hook-form + zod | Lint rule blocks `useState` for form fields beyond 1 field |
| All routes are protected by role except `/login` and `/register` | Router config in `apps/web/src/router.tsx` |
| JWT in memory + refresh token in httpOnly cookie OR localStorage with strict rotation | See `docs/05-auth-and-routing.md` |
| `<SideNav>` only shows links the current user's role can access | Role-group filtering in `apps/web/src/components/layout/SideNav.tsx` via `@/lib/roles` |
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
│   └── web/                              # @viacerta/web — single app, single deploy
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── index.html
│       ├── tailwind.config.ts
│       ├── postcss.config.cjs
│       ├── public/
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── router.tsx                # single router: student/parent + advisor + internal
│       │   ├── routes/
│       │   │   ├── auth/
│       │   │   │   ├── LoginPage.tsx
│       │   │   │   └── RegisterPage.tsx
│       │   │   ├── HomePage.tsx          # "/" — role-based landing redirect
│       │   │   ├── ForbiddenPage.tsx
│       │   │   ├── NotFoundPage.tsx
│       │   │   ├── student/
│       │   │   │   ├── DashboardPage.tsx
│       │   │   │   ├── IntakeStartPage.tsx
│       │   │   │   ├── IntakeFormPage.tsx
│       │   │   │   ├── DocumentsPage.tsx
│       │   │   │   ├── PendingPage.tsx
│       │   │   │   ├── ReportPage.tsx
│       │   │   │   └── DecisionGatePage.tsx
│       │   │   ├── parent/
│       │   │   │   └── ParentSummaryPage.tsx
│       │   │   ├── advisor/              # RoleGate-wrapped in router.tsx
│       │   │   │   ├── CaseQueuePage.tsx
│       │   │   │   ├── StudentDetailPage.tsx
│       │   │   │   ├── AssessmentPage.tsx
│       │   │   │   ├── GcriPage.tsx
│       │   │   │   ├── ReportBuilderPage.tsx
│       │   │   │   └── CalibrationPage.tsx
│       │   │   └── internal/             # RoleGate-wrapped in router.tsx
│       │   │       ├── LeadsPage.tsx
│       │   │       ├── DocumentVerifyPage.tsx
│       │   │       ├── DataOpsPage.tsx
│       │   │       ├── OutcomesPage.tsx
│       │   │       └── UsersPage.tsx
│       │   ├── features/                 # one folder per domain feature
│       │   │   ├── auth/
│       │   │   ├── intake/
│       │   │   ├── documents/
│       │   │   ├── report/
│       │   │   ├── decision/
│       │   │   └── journey/
│       │   ├── components/
│       │   │   ├── layout/               # AppShell, SideNav, TopBar, PageContainer
│       │   │   └── shared/               # ProtectedRoute, RoleGate
│       │   ├── hooks/
│       │   ├── stores/
│       │   │   └── auth-store.ts         # single auth store, AppRole-aware
│       │   ├── lib/
│       │   │   ├── query-client.ts
│       │   │   ├── env.ts
│       │   │   ├── roles.ts              # role-group constants for RoleGate/SideNav
│       │   │   └── destination-by-role.ts
│       │   └── styles/
│       │       └── globals.css
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
    ├── api-client/                      # @viacerta/api-client — single entry point
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── src/
    │   │   ├── index.ts                 # apiAxios, apiClient, authStorage, types
    │   │   ├── axios-instance.ts        # base axios with interceptors
    │   │   ├── auth-storage.ts          # token persistence (single namespace)
    │   │   ├── refresh-interceptor.ts
    │   │   ├── errors.ts                # ApiError, ValidationError, etc.
    │   │   └── generated/
    │   │       └── api.d.ts             # merged from /openapi.json + /advisor/openapi.json
    │   └── scripts/
    │       └── generate.ts              # fetches both specs, merges, runs openapi-typescript
    │
    ├── design-tokens/                   # @viacerta/design-tokens
    │   ├── package.json
    │   ├── src/
    │   │   ├── index.ts
    │   │   ├── colors.ts                # navy/amber/green palette + flag semantics
    │   │   ├── typography.ts
    │   │   ├── spacing.ts
    │   │   └── tailwind-preset.ts       # exports Tailwind preset for apps/web
    │   └── tests/
    │
    └── utils/                           # @viacerta/utils
        ├── package.json
        ├── src/
        │   ├── index.ts
        │   ├── format.ts                # currency (INR/EUR/USD), date, number
        │   ├── audience.ts              # FORBIDDEN_KEYS for dev-mode lint
        │   ├── flags.ts                 # GCSS flag → color, label, recommendation
        │   ├── routes.ts                # named routes for apps/web
        │   └── types.ts                 # AppRole = PortalRole | AdvisorRole, AuthUser
        └── tests/
```

---

## Patterns Claude Code must follow

### Pattern 1: pages are thin, features are smart

Each route file in `apps/web/src/routes/` is a wrapper. It imports a feature component and does nothing else.

```tsx
// apps/web/src/routes/student/ReportPage.tsx
import { StudentReport } from "../../features/report/StudentReport";

export default function ReportPage() {
  return <StudentReport />;
}
```

```tsx
// apps/web/src/features/report/StudentReport.tsx
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
// apps/web/src/features/report/useStudentReport.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@viacerta/api-client";

export function useStudentReport() {
  return useQuery({
    queryKey: ["studentReport", "latest"],
    queryFn: () => apiClient.GET("/api/v1/portal/students/me/report"),
    select: (r) => r.data,
    staleTime: 60_000,
  });
}
```

### Pattern 3: mutations always return a typed Promise + invalidate the right queries

```tsx
// apps/web/src/features/assessment/useGcssOverride.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@viacerta/api-client";

export function useGcssOverride(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: GcssOverrideRequest) =>
      apiClient.POST(
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
// apps/web/src/features/assessment/OverrideDialog.tsx
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

### Pattern 6: audience separation enforced by role-gated routes, not imports

`@viacerta/api-client` exports a single merged set of types — `StudentReportResponse` and `AdvisorAssessmentResponse` both live in `@viacerta/api-client` and either can be imported from any feature. The boundary that matters is **which routes a role can reach**, enforced with `<RoleGate>`:

```tsx
// apps/web/src/router.tsx
{
  path: "/students/:studentId/assessment",
  element: (
    <RoleGate allow={ADVISOR_ROLES}>
      <AssessmentPage />
    </RoleGate>
  ),
},
```

`ADVISOR_ROLES`, `ADMIN_ONLY`, etc. are role-group constants in `apps/web/src/lib/roles.ts`. A STUDENT hitting `/students/:id/assessment` is redirected to `/forbidden` by `<RoleGate>`. See [ADR-007](./ADR-007-single-app-merge.md) for why this replaced the old import-level (build-time) separation, and what that gives up.

---

## First task on a fresh repo (Claude Code: do these in order)

1. Initialize pnpm workspace: `pnpm init`, create `pnpm-workspace.yaml`.
2. Create root `tsconfig.base.json`, `.eslintrc.cjs`, `.prettierrc`.
3. Create `packages/design-tokens` — colors, spacing, Tailwind preset.
4. Create `packages/utils` — flags helper, formatters, route names, `AppRole`/`AuthUser` types.
5. Create `packages/api-client` — base axios + auth storage + refresh interceptor. Add `scripts/generate.ts` (fetches `http://localhost:8000/openapi.json` and `/advisor/openapi.json`, merges them, runs `openapi-typescript` once).
6. Create `packages/ui` — primitives first (Button, Input, Card), then feedback (AsyncBoundary), then domain (GcssFlag, ScoreGauge).
7. Create `apps/web`: Vite scaffold, single Router, Login + Register pages, single auth store.
8. Implement student flow page by page (intake → documents → pending → report → decision), then parent summary.
9. Implement advisor flow: case queue → student detail → assessment → confirm → GCRI → report builder, each route wrapped in `<RoleGate>`.
10. Internal ops pages last, also `<RoleGate>`-wrapped.
11. Run `pnpm -r test` — everything green.

---

## When in doubt

- If two docs disagree, **this file wins**, but flag the disagreement.
- If a backend endpoint exists but isn't documented here, generate types and use it.
- If a backend endpoint doesn't exist for a UI need, **don't invent it** — open a question.
- Adding a new advisor/internal route? Wrap it in `<RoleGate allow={...}>` in `router.tsx` and add it to `SideNav` with the right `allow` group. Forgetting `<RoleGate>` is the one mistake that bypasses audience separation entirely now that it's runtime-only — see [ADR-007](./ADR-007-single-app-merge.md).
