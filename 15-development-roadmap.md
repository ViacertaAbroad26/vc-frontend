# 15 — Development Roadmap

> Frontend phasing aligned to the backend roadmap (`backend/docs/14-development-roadmap.md`). Same principle: build order with measurable definition of done, not vanity feature lists.
>
> Note on terminology: "portal app" / "advisor app" below refer to the
> student/parent surface and the advisor/internal-ops surface of the single
> `apps/web` app — not separate deployments. See
> [ADR-007](./ADR-007-single-app-merge.md).

## Phase 0 — Foundation (weeks 0–2)

**Goal**: empty monorepo → `apps/web` boots, hits a real backend, log in.

| Deliverable | Done when |
|---|---|
| pnpm workspace bootstrap | `pnpm install` from a fresh clone produces a working tree |
| `packages/design-tokens` | Colors, typography, spacing, Tailwind preset exported and consumed by `apps/web` |
| `packages/utils` | `format`, `flags`, `audience` helpers + tests |
| `packages/api-client` | Axios instance + refresh interceptor + `generate` script (merges both backend OpenAPI specs) working against local backend |
| `packages/ui` primitives | Button, Input, Card, Label, Dialog, Toast, AsyncBoundary |
| `apps/web` scaffold | Vite dev server starts on 5173; single `router.tsx` + `HomePage` role-based landing renders |
| Auth round-trip | Register/Login on `apps/web`; localStorage tokens; refresh interceptor verified with backend |
| Role-gated route test | `<RoleGate allow={...}>` redirects a STUDENT away from an advisor route to `/forbidden`; covered by a routing test in CI |

**Success**: a new engineer can clone, `pnpm install`, `pnpm dev`, register a student, register an advisor (seeded by backend), and log into `apps/web` as both roles.

---

## Phase 1 — MVP (weeks 2–12): Stage 1 Assessment Engine

Mirrors the backend's Phase 1. Build the screens needed for a student to go end-to-end through Stage 1 with an advisor.

### Student/parent surface — build order

1. **Auth pages** — LoginPage, RegisterPage (forms already in `docs/08`).
2. **AppShell + JourneyDashboard** — TopBar, SideNav, NextActionCard, JourneyTimeline.
3. **Intake**:
   - IntakeStartPage (persona picker)
   - IntakeFormPage with dynamic schema build, save-and-resume, SaveResumeIndicator
   - IntakeSubmitPage (submit + transition)
4. **DocumentsPage** — upload tiles per required doc, evidence badges, re-upload.
5. **PendingPage** — polling AI pre-score status (10s cadence).
6. **ReportPage** — six sections, audience-filtered fields only, PDF download.
7. **DecisionGatePage** — three-choice + reason form.

### Advisor/internal surface — build order

1. **Auth + AppShell + RoleGate** for advisor/internal routes.
2. **CaseQueuePage** — URL-driven filters, polling 30s focused, search.
3. **StudentDetailPage** with tabs:
   - **AssessmentTab** — full dimension + sub-score breakdown, OverrideDialog (evidence-required), confirm gate
   - **GcriTab** — trigger run (blocked at GCSS<60 by server), per-country breakdown, override ±5 dialog
   - **ReportComposerTab** — six InsightEditor sections with sentence-count validation, publish gate
   - **SessionsTab** — record Session 1 / Session 2
   - **AuditTab** — paginated audit trail with evidence display
4. **GcriHeatmap** component for cross-country overview.
5. **Internal ops** (LeadsPage, DocumentVerificationPage) — minimum needed for ops to function.

### MVP definition of done — frontend

A real student goes through:

1. Register on `apps/web`
2. Complete persona-routed intake form (save-and-resume verified working across browser sessions)
3. Upload required documents
4. See pending state while AI pre-score runs
5. After advisor confirms, see published report
6. Make decision at gate

A real advisor goes through:

1. Log in to `apps/web`, land on the advisor surface
2. See case in queue with correct flag + SLA state
3. Open assessment, apply overrides with evidence
4. Confirm assessment, trigger GCRI for 3 countries
5. Author 6 insight blocks (sentence-count validation enforced)
6. Publish report
7. Record Session 1 and Session 2

### MVP non-goals (frontend-specific)

- Calibration UI (Phase 2)
- Outcomes capture UI (Phase 2; backend stores it, but the UI can be a coordinator-only stopgap form)
- Storybook (component library still small)
- i18n (English only)
- Mobile-app shell
- Service worker / offline mode
- Heavy charting beyond `RoiChart` + dimension bars + GCRI heatmap (no radar charts, no animated gauges)

### MVP success criteria

- 10 real students complete the journey end-to-end on `apps/web`.
- Two advisors independently use the advisor surface for the same blind case; inter-rater variance < 10 GCSS points (alignment with backend Phase 1 success criteria).
- `<RoleGate>` route-access tests cover every advisor/internal route; CI green.
- Audience-separation tests cover every student/parent route; CI green.
- A single bundle budget for `apps/web` is met (see `docs/14-deployment.md`); `size-limit` CI check passes.
- Lighthouse on `/report` published page: Performance ≥ 90, Accessibility ≥ 95.

---

## Phase 2 — Full-Service Workflow + Ops Maturation (weeks 12–28)

Aligned with backend Phase 2.

### New screens

1. **Stages 2–7 case management UI** — advisor + ops views for country mapping, shortlisting, document prep, applications, visa, pre-departure, placement. Each stage has:
   - Status tile on student detail (per-stage gate state)
   - Coordinator queue view filtered by stage
2. **Data ops dashboard** — full matrix-cell freshness table, version list, downgrade dialog with evidence note, adapter status indicators (LinkedIn / IRCC / EURES / IMF — green/yellow/red).
3. **Calibration UI** — weekly blind-scoring cases, variance dashboard for Senior Advisor.
4. **Notifications inbox** — student + advisor inbox showing sequence-driven notifications (intake reminders, application deadlines, etc.).
5. **OutcomesPage** — full Year-1 / Year-3 capture form (Career Services + Admin), bulk import for past students.
6. **Dispute resolution screens** — student opens dispute via portal, advisor sees dispute thread on the audit tab.
7. **Storybook** — set up for `packages/ui` once it crosses ~25 components; visual regression via Chromatic optional.

### Phase 2 definition of done

- A coordinator manages 50 concurrent students across Stages 1–7 without spreadsheets.
- Calibration variance dashboard surfaces weekly inter-rater check; Senior Advisor reviews and decides on rubric bumps.
- Storybook deployed for internal use; new contributors can find a primitive in < 30 seconds.
- Notification preferences page exists; student can toggle sequence subscriptions.

### Phase 2 success criteria

- Stage 2–7 progression rate matches backend's target (Stage 1 → Stage 2 ≥ 70% for Green/Yellow).
- Per-stage SLA breach rate visible in advisor dashboard < 10%.
- Inter-rater variance trends < 8 GCSS points average over 8 consecutive weeks.

---

## Phase 3 — Intelligence + Predictive UI (weeks 28–52+)

Backend Phase 3 trains a predictive outcome model. Frontend changes:

### New screens

1. **Predictive confidence band on GCRI** — alongside each country's score, show "predicted Year-1 employment likelihood: 62% ± 8%" with model version pinning. Audience-filtered (advisor-only in MVP of this; eventually surfaces to students with appropriate framing).
2. **Outcome data quality dashboard** — Career Services sees outcome coverage by cohort.
3. **Calibration v2** — rubric drafting tool that consumes the analyst's calibration notebook output.
4. **Adaptive Session 1 questions** — backend generates a question sequence pre-Session 1; advisor approves it; the student/parent surface renders it as a guided pre-session form.

### Phase 3 success criteria

- Predictive band shown on report when model is at AUC ≥ 0.7 (gated by backend).
- Calibration UI used at least quarterly to draft new rubric versions.

### Implementation status

Items 1 and 2 are **done ahead of the AUC ≥ 0.7 gate**, backed by the backend's `heuristic-v1`
prior (`app/scoring/outcome_prior.py`) rather than a fitted model — consistent with the
CPRA-HM-style "offer probability range + advisor confidence level" framing rather than a
single AUC number:

- `OutcomePredictionBand` (`packages/ui/src/viacerta/OutcomePredictionBand.tsx`) renders
  `outcomeProbabilityLow`–`outcomeProbabilityHigh` as a range (e.g. "54-70%") plus, on the
  advisor GCRI view only, `outcomeConfidenceLevel` as "Advisor confidence: X/10". The student
  report (`ReportSections.tsx`) shows the range without the confidence level (audience
  separation). When the backend graduates to a fitted model with a real AUC/Brier score, these
  same fields are repopulated from that model — no frontend change needed.
- The Outcomes coverage dashboard (`apps/web/src/routes/internal/OutcomesPage.tsx` →
  `OutcomeCoverageView`) reads `GET /api/v1/internal/outcomes/coverage` and shows a per-cohort
  (target-intake) table of confirmed assessments vs. captured Year-1/Year-3 outcomes, gated to
  `CAREER_ROLES`.

---

## Phase 4 — Multi-Tenancy & Platform RBAC (week 52+) — ✅ DONE

Aligned with backend Phase 4 (org-scoping + `SUPER_ADMIN` platform role, also marked done in `backend/docs/14-development-roadmap.md`).

### Delivered

1. **`orgId` on the auth user** — `orgId: string | null` added to `AuthUser` (`packages/utils/src/types.ts`), populated from `/auth/me`, login, register, and refresh responses. No new UI filters added — branch-scoped lists (advisor cases, documents, sessions, outcomes coverage/correlation, calibration correlations) already come back pre-filtered by the backend's `org_id` scoping; the frontend doesn't re-filter or duplicate this.
2. **`SUPER_ADMIN` role** — added to `UserRole` / `AdvisorRole` / `AppRole`. `RoleGate` treats it as god-mode, bypassing every route's `allow` list; `SideNav` shows every nav item to a `SUPER_ADMIN` regardless of the item's `allow` group.
3. **Registration & user-management role restrictions** — the public registration role dropdown excludes `ADMIN`/`SUPER_ADMIN`; the internal create-user and change-role screens only offer `SUPER_ADMIN` as an option when the acting user is already `SUPER_ADMIN` (`assignableRoles()` in `apps/web/src/features/users/roles.ts`), with a graceful message if a 403 slips through.
4. **Organizations / Branches admin screen** — new `/organizations` route, `SUPER_ADMIN`-only (`SUPER_ADMIN_ONLY` in `apps/web/src/lib/roles.ts`), lists branches and lets a `SUPER_ADMIN` add a new one via `GET`/`POST /internal/organizations`.
5. **Dev-mode role/org switcher** — `DevRoleSwitcher` on `LoginPage` (dev builds only, `import.meta.env.DEV`). Sets `X-Dev-Role` / `X-Dev-User` / `X-Dev-Student` / `X-Dev-Org` headers via `devOverrideStorage` + an axios request interceptor, mirroring the backend's `AUTH_OPTIONAL` dev-bypass (`app/deps.py`) — lets a developer preview any role, including `SUPER_ADMIN`, and any branch, without a seeded login.

### Phase 4 success criteria (met)

- `pnpm -r run typecheck` / `lint` / `apps/web` test suite (78/78) / `build` / `size-limit` all green.
- `RoleGate`'s `SUPER_ADMIN` bypass covered by a router test (`/data-ops` reachable as `SUPER_ADMIN` despite its `DATA_OPS_ROLES` gate).
- `/organizations` route + screen covered by a component test (list + create branch) and a router-access test (`SUPER_ADMIN` allowed, `STUDENT` redirected to `/forbidden`).

---

## Phase 5 — Productisation (Public API / SDK / Billing) — future

Aligned with backend Phase 5 (extracting Stage 1 as a standalone SaaS, building on the multi-tenancy + `SUPER_ADMIN` platform role delivered in Phase 4).

### Frontend changes

1. **Embeddable assessment widget** — a versioned, sandboxed iframe / web component that 3rd-party orgs embed on their site:
   - Renders the intake form scoped to their `org_id`
   - Returns the published report via webhook + a tenant-specific student-facing URL
2. **Tenant admin UI** — separate Vercel project (`platform.viacerta.com`) for SaaS customers to manage their API keys, see usage, customise rubric (within whitelist), brand the embedded widget.
3. **White-label theming** — `packages/design-tokens` extended to support per-tenant color overrides via CSS variables; build pipeline produces tenant-specific CSS bundles.
4. **Multi-tenant routing on `apps/web`** — `app.viacerta.com/t/<org>/...` or a per-tenant subdomain; auth becomes tenant-aware (builds on Phase 4's `orgId`-aware auth).

### Phase 5 success criteria

- At least 3 third-party orgs onboarded with embedded widgets.
- Per-tenant theming working in production without code changes to `apps/web` per-tenant.
- Asset budget per tenant bundle < 320 KB gz.

---

## Cross-cutting deferred work

| Item | Why deferred |
|---|---|
| Native mobile apps | Responsive web covers all required interactions through Phase 2 |
| i18n | English only until first non-Indian-English audience needs it |
| Service worker / offline | Adds state-sync complexity without clear benefit for our usage pattern |
| Real-time websocket updates | Polling is plenty at MVP/Phase 2 scale; revisit at 10× student volume |
| Component library v2 (more primitives, animations) | Wait for `packages/ui` to feel constraining, not just sparse |
| Storybook visual regression (Chromatic) | Phase 2 only, once the library is stable |

## Risks worth flagging

| Risk | Phase impact | Mitigation |
|---|---|---|
| Backend OpenAPI spec changes without frontend re-generation | All phases | CI step verifies committed types match live spec (`docs/14`) |
| Missing `<RoleGate>` on a new advisor/internal route exposes it to other roles | MVP+ | Route-access tests + code review; no build-level backstop now that audience separation is runtime-only (ADR-007) |
| Bundle size creep beyond budget | MVP+P2 | `size-limit` CI gate; `React.lazy()` code-splitting for advisor/internal routes (ADR-007 follow-up) |
| Form schema drift between RHF zod and backend Pydantic | MVP | Schemas mirror backend names + constraints; periodic drift-audit |
| Refresh interceptor edge cases (tab focus + offline) | MVP | Tests in `packages/api-client/src/__tests__/refresh-interceptor.test.ts` |

## What good looks like at each phase

- **End of Phase 0**: a stranger can clone the repo and have `apps/web` running with login flow in < 30 minutes.
- **End of MVP**: a real student goes through Stage 1 entirely in the system, an advisor uses the console daily, ops manages document verification without spreadsheets.
- **End of Phase 2**: 50 concurrent students managed across all 7 stages; calibration UI used weekly; ops dashboard makes data freshness obvious.
- **End of Phase 3**: predictive intelligence visible on reports; advisors trust it enough to act on it.
- **End of Phase 4**: every branch's data is isolated by `org_id`, a `SUPER_ADMIN` can administer across all branches via the Branches screen, and a developer can preview any role/branch via the dev-mode switcher without a seeded login.
- **End of Phase 5**: assessment engine generates revenue independently of full-service consultancy.
