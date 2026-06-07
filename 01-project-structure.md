# 01 — Project Structure

> pnpm monorepo. Two apps + four packages. Build the exact tree below.

## Root layout

```
frontend/
├── CLAUDE.md
├── README.md
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── .eslintrc.cjs
├── .prettierrc
├── .nvmrc                 # "20"
├── .gitignore
│
├── docs/
├── adrs/
│
├── apps/
│   ├── portal/
│   └── advisor/
│
└── packages/
    ├── ui/
    ├── api-client/
    ├── design-tokens/
    └── utils/
```

## Root config files

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Root `package.json`

```json
{
  "name": "viacerta-frontend",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel run dev",
    "build": "pnpm -r run build",
    "test": "pnpm -r run test",
    "test:watch": "pnpm -r --parallel run test:watch",
    "e2e": "pnpm --filter @viacerta/portal-e2e run e2e && pnpm --filter @viacerta/advisor-e2e run e2e",
    "lint": "pnpm -r run lint",
    "typecheck": "pnpm -r run typecheck",
    "format": "prettier --write .",
    "generate-api": "pnpm --filter @viacerta/api-client run generate"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.2.0",
    "typescript": "^5.4.0"
  },
  "packageManager": "pnpm@8.15.0",
  "engines": {
    "node": ">=20"
  }
}
```

### `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "forceConsistentCasingInFileNames": true,
    "useDefineForClassFields": true
  }
}
```

## Apps

### `apps/portal/`

```
apps/portal/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── index.html
├── tailwind.config.ts
├── postcss.config.cjs
├── .env.example
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx                 # ReactDOM.createRoot
    ├── App.tsx                  # providers (QueryClient, Router, ThemeProvider)
    ├── router.tsx               # createBrowserRouter
    ├── lib/
    │   ├── env.ts               # zod-validated import.meta.env
    │   └── query-client.ts      # TanStack QueryClient
    ├── stores/
    │   ├── auth-store.ts        # Zustand: user, tokens
    │   └── intake-store.ts      # Zustand: partial answers cache
    ├── hooks/
    │   ├── use-auth.ts
    │   └── use-redirect-by-role.ts
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.tsx
    │   │   ├── TopBar.tsx
    │   │   ├── SideNav.tsx
    │   │   └── PageContainer.tsx
    │   └── shared/
    │       ├── ProtectedRoute.tsx
    │       └── RoleGate.tsx
    ├── features/                # one folder per domain feature
    │   ├── auth/
    │   │   ├── LoginForm.tsx
    │   │   ├── RegisterForm.tsx
    │   │   ├── useLogin.ts
    │   │   └── useRegister.ts
    │   ├── intake/
    │   │   ├── PersonaPicker.tsx
    │   │   ├── IntakeForm.tsx
    │   │   ├── IntakeSection.tsx
    │   │   ├── IntakeQuestion.tsx
    │   │   ├── SaveResumeIndicator.tsx
    │   │   ├── useIntakeStart.ts
    │   │   ├── useIntakeSave.ts
    │   │   └── useIntakeSubmit.ts
    │   ├── documents/
    │   │   ├── DocumentUploader.tsx
    │   │   ├── DocumentList.tsx
    │   │   ├── useDocumentList.ts
    │   │   └── useDocumentUpload.ts
    │   ├── pending/
    │   │   └── AiPreScorePending.tsx
    │   ├── journey/
    │   │   ├── JourneyTimeline.tsx
    │   │   └── useJourney.ts
    │   ├── report/
    │   │   ├── StudentReport.tsx
    │   │   ├── components/
    │   │   │   ├── ReportHeader.tsx
    │   │   │   ├── GcssSection.tsx
    │   │   │   ├── GcriSection.tsx
    │   │   │   ├── InsightsSection.tsx
    │   │   │   ├── RoiSection.tsx
    │   │   │   ├── RiskRegisterSection.tsx
    │   │   │   ├── NinetyDayPlanSection.tsx
    │   │   │   └── ParentSummary.tsx
    │   │   ├── useStudentReport.ts
    │   │   └── useReportPdf.ts
    │   ├── decision/
    │   │   ├── DecisionGate.tsx
    │   │   └── useRecordDecision.ts
    │   └── parent/
    │       ├── ParentLinkRequest.tsx
    │       ├── ParentSummaryView.tsx
    │       └── useParentSummary.ts
    ├── routes/                  # thin route components
    │   ├── auth/
    │   │   ├── LoginPage.tsx
    │   │   └── RegisterPage.tsx
    │   ├── student/
    │   │   ├── DashboardPage.tsx
    │   │   ├── IntakeStartPage.tsx
    │   │   ├── IntakeFormPage.tsx
    │   │   ├── DocumentsPage.tsx
    │   │   ├── PendingPage.tsx
    │   │   ├── ReportPage.tsx
    │   │   ├── DecisionGatePage.tsx
    │   │   └── JourneyPage.tsx
    │   ├── parent/
    │   │   └── ParentSummaryPage.tsx
    │   └── NotFoundPage.tsx
    ├── styles/
    │   └── globals.css          # Tailwind layers + custom CSS variables
    └── test/
        ├── setup.ts
        ├── msw-handlers.ts      # MSW handlers for portal endpoints
        └── fixtures/
            └── aditya.ts        # Aditya Basu fixture matching the live scorecard
```

### `apps/advisor/`

Same structure, different features:

```
apps/advisor/src/
├── features/
│   ├── auth/
│   ├── cases/
│   │   ├── CaseQueue.tsx
│   │   ├── CaseFilters.tsx
│   │   ├── CaseRow.tsx
│   │   └── useCases.ts
│   ├── student-detail/
│   │   ├── StudentDetail.tsx
│   │   ├── IntakeAnswersPanel.tsx
│   │   ├── DocumentsPanel.tsx
│   │   ├── AuditTrailPanel.tsx
│   │   └── useStudentDetail.ts
│   ├── assessment/
│   │   ├── AssessmentView.tsx
│   │   ├── DimensionPanel.tsx
│   │   ├── SubScoreRow.tsx
│   │   ├── OverrideDialog.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── useAssessment.ts
│   │   ├── useGcssOverride.ts
│   │   └── useConfirmAssessment.ts
│   ├── gcri/
│   │   ├── GcriRunDialog.tsx
│   │   ├── GcriResultsView.tsx
│   │   ├── GcriCountryCard.tsx
│   │   ├── GcriOverrideDialog.tsx
│   │   ├── useTriggerGcri.ts
│   │   ├── useGcriResults.ts
│   │   └── useGcriOverride.ts
│   ├── report-builder/
│   │   ├── ReportBuilder.tsx
│   │   ├── InsightEditor.tsx
│   │   ├── SectionPreview.tsx
│   │   ├── PublishButton.tsx
│   │   ├── useBuildReport.ts
│   │   ├── useAddInsight.ts
│   │   └── usePublishReport.ts
│   ├── calibration/
│   │   └── CalibrationCases.tsx
│   ├── leads/
│   │   ├── LeadsList.tsx
│   │   └── AssignAdvisorDialog.tsx
│   ├── document-verify/
│   │   ├── DocumentVerifyList.tsx
│   │   └── VerifyDialog.tsx
│   ├── data-ops/
│   │   ├── RubricVersionList.tsx
│   │   ├── MatrixVersionList.tsx
│   │   ├── FreshnessDashboard.tsx
│   │   └── HardcodedDowngradeDialog.tsx
│   └── outcomes/
│       ├── OutcomeCaptureForm.tsx
│       └── OutcomesList.tsx
├── routes/
│   ├── auth/
│   ├── advisor/
│   │   ├── CaseQueuePage.tsx
│   │   ├── StudentDetailPage.tsx
│   │   ├── AssessmentPage.tsx
│   │   ├── GcriPage.tsx
│   │   ├── ReportBuilderPage.tsx
│   │   └── CalibrationPage.tsx
│   ├── internal/
│   │   ├── LeadsPage.tsx
│   │   ├── DocumentVerifyPage.tsx
│   │   ├── DataOpsPage.tsx
│   │   ├── UsersPage.tsx
│   │   └── OutcomesPage.tsx
│   └── NotFoundPage.tsx
```

## Packages

### `packages/ui/` — `@viacerta/ui`

```
packages/ui/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                  # barrel
│   ├── primitives/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Checkbox.tsx
│   │   ├── RadioGroup.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Dialog.tsx
│   │   ├── Drawer.tsx
│   │   ├── Toast.tsx
│   │   ├── Tabs.tsx
│   │   ├── Accordion.tsx
│   │   ├── Table.tsx
│   │   ├── Tooltip.tsx
│   │   └── Label.tsx
│   ├── feedback/
│   │   ├── Spinner.tsx
│   │   ├── Skeleton.tsx
│   │   ├── ErrorState.tsx
│   │   ├── EmptyState.tsx
│   │   └── AsyncBoundary.tsx
│   ├── layout/
│   │   ├── PageHeader.tsx
│   │   ├── Section.tsx
│   │   ├── Stack.tsx
│   │   └── Divider.tsx
│   └── viacerta/                 # domain components shared across apps
│       ├── GcssFlagBadge.tsx
│       ├── RiskBandPill.tsx
│       ├── ScoreGauge.tsx
│       ├── DimensionBar.tsx
│       ├── EvidenceLevelBadge.tsx
│       ├── PersonaIcon.tsx
│       └── ReportDisclaimer.tsx
└── tests/
```

### `packages/api-client/` — `@viacerta/api-client`

```
packages/api-client/
├── package.json
├── tsconfig.json
├── src/
│   ├── portal.ts                 # exports portalClient + portal types ONLY
│   ├── advisor.ts                # exports advisorClient + advisor types
│   ├── axios-instance.ts         # shared axios factory with interceptors
│   ├── auth-storage.ts           # token persistence (localStorage)
│   ├── refresh-interceptor.ts    # auto-refresh on 401
│   ├── errors.ts                 # ApiError, ValidationError parser
│   └── generated/
│       ├── portal.d.ts           # from /openapi.json — DO NOT EDIT
│       └── advisor.d.ts          # from /advisor/openapi.json — DO NOT EDIT
└── scripts/
    └── generate.ts               # runs openapi-typescript against backend
```

**Package.json `exports` enforces audience separation**:

```json
{
  "name": "@viacerta/api-client",
  "exports": {
    "./portal": {
      "types": "./src/portal.ts",
      "default": "./src/portal.ts"
    },
    "./advisor": {
      "types": "./src/advisor.ts",
      "default": "./src/advisor.ts"
    },
    "./errors": "./src/errors.ts"
  }
}
```

Portal app imports only from `@viacerta/api-client/portal`. Advisor app from `@viacerta/api-client/advisor`. ESLint rule prevents portal from importing `/advisor`.

### `packages/design-tokens/` — `@viacerta/design-tokens`

```
packages/design-tokens/
├── package.json
├── src/
│   ├── index.ts
│   ├── colors.ts                 # palette + flag colors
│   ├── typography.ts             # font sizes, weights, line heights
│   ├── spacing.ts                # 4px scale
│   ├── radius.ts
│   ├── shadows.ts
│   └── tailwind-preset.ts        # exports Tailwind preset object
└── tests/
```

### `packages/utils/` — `@viacerta/utils`

```
packages/utils/
├── package.json
├── src/
│   ├── index.ts
│   ├── format.ts                 # formatCurrency, formatDate, formatNumber
│   ├── flags.ts                  # gcssFlagToColor, gcssFlagToLabel, recommendationFor
│   ├── audience.ts               # FORBIDDEN_PORTAL_KEYS for dev-mode lint
│   ├── routes.ts                 # named routes for both apps
│   ├── env.ts                    # zod env validator factory
│   └── types.ts                  # shared brand types (Iso2, UlidString, etc.)
└── tests/
```

## Naming conventions

| What | Convention | Example |
|---|---|---|
| File: component | PascalCase | `OverrideDialog.tsx` |
| File: hook | kebab-case | `use-cases.ts` (or `useCases.ts` — pick one and lint it) |
| File: util | kebab-case | `format.ts` |
| Component | PascalCase | `<OverrideDialog />` |
| Hook | camelCase, prefix `use` | `useGcssOverride` |
| Zustand store | suffix `-store` | `auth-store.ts` |
| Route file | suffix `Page` | `ReportPage.tsx` |
| Feature folder | kebab-case domain | `report-builder/` |

## Imports

Strict order (enforced by ESLint `import/order`):

1. Node built-ins
2. External packages
3. Internal `@viacerta/*` packages
4. Aliased local imports (`@/`)
5. Relative imports
6. CSS/asset imports

```tsx
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button, Card } from "@viacerta/ui";
import { portalClient } from "@viacerta/api-client/portal";
import { gcssFlagToLabel } from "@viacerta/utils";

import { useAuth } from "@/hooks/use-auth";

import { ReportHeader } from "./components/ReportHeader";

import "./styles.css";
```

## Aliases (per app)

`vite.config.ts` and `tsconfig.json` both define:

```ts
// vite.config.ts
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
}
```

## Module boundary rules (lint-enforced)

| Rule | Enforced via |
|---|---|
| `apps/portal` cannot import from `apps/advisor` | tsconfig — apps don't reference each other |
| `apps/portal` cannot import `@viacerta/api-client/advisor` | ESLint `no-restricted-imports` |
| `apps/advisor` cannot import `@viacerta/api-client/portal` | ESLint `no-restricted-imports` |
| `features/*` cannot import from sibling `features/*` directly | ESLint `no-restricted-imports` — go through `components/shared` or hooks |
| No direct `axios` outside `packages/api-client` | ESLint `no-restricted-imports` |
| No `useState` for form fields > 1 — use react-hook-form | Custom ESLint rule (Phase 2) |
