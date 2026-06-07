# 15 — Development Roadmap

> Frontend phasing aligned to the backend roadmap (`backend/docs/14-development-roadmap.md`). Same principle: build order with measurable definition of done, not vanity feature lists.

## Phase 0 — Foundation (weeks 0–2)

**Goal**: empty monorepo → both apps boot, hit a real backend, log in.

| Deliverable | Done when |
|---|---|
| pnpm workspace bootstrap | `pnpm install` from a fresh clone produces a working tree |
| `packages/design-tokens` | Colors, typography, spacing, Tailwind preset exported and consumed by both apps |
| `packages/utils` | `format`, `flags`, `audience` helpers + tests |
| `packages/api-client` | Axios instance + refresh interceptor + `generate` script working against local backend |
| `packages/ui` primitives | Button, Input, Card, Label, Dialog, Toast, AsyncBoundary |
| `apps/portal` scaffold | Vite dev server starts on 5173; PortalShell + Router renders |
| `apps/advisor` scaffold | Vite dev server starts on 5174; AdvisorShell + Router renders |
| Auth round-trip | Register/Login on both apps; localStorage tokens; refresh interceptor verified with backend |
| ESLint cross-app guard | Portal cannot import from `@viacerta/api-client/advisor`; CI lints both apps |
| Bundle leak check | `scripts/check-portal-bundle.sh` runs in CI |

**Success**: a new engineer can clone, `pnpm install`, `pnpm dev`, register a student in the portal, register an advisor (seeded by backend), log into both apps.

---

## Phase 1 — MVP (weeks 2–12): Stage 1 Assessment Engine

Mirrors the backend's Phase 1. Build the screens needed for a student to go end-to-end through Stage 1 with an advisor.

### Portal — build order

1. **Auth pages** — LoginPage, RegisterPage (forms already in `docs/08`).
2. **Portal shell + JourneyDashboard** — TopBar, side nav, NextActionCard, JourneyTimeline.
3. **Intake**:
   - IntakeStartPage (persona picker)
   - IntakeFormPage with dynamic schema build, save-and-resume, SaveResumeIndicator
   - IntakeSubmitPage (submit + transition)
4. **DocumentsPage** — upload tiles per required doc, evidence badges, re-upload.
5. **PendingPage** — polling AI pre-score status (10s cadence).
6. **ReportPage** — six sections, audience-filtered fields only, PDF download.
7. **DecisionGatePage** — three-choice + reason form.

### Advisor — build order

1. **Auth + AdvisorShell + RoleGate**.
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

1. Register on portal
2. Complete persona-routed intake form (save-and-resume verified working across browser sessions)
3. Upload required documents
4. See pending state while AI pre-score runs
5. After advisor confirms in advisor app, see published report
6. Make decision at gate

A real advisor goes through:

1. Log in to advisor app
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

- 10 real students complete the journey end-to-end on the portal.
- Two advisors independently use the advisor app for the same blind case; inter-rater variance < 10 GCSS points (alignment with backend Phase 1 success criteria).
- `scripts/check-portal-bundle.sh` passes on every PR (no advisor strings leak into portal bundle).
- Audience-separation tests cover every portal route; CI green.
- Bundle budgets met: portal < 280 KB gz, advisor < 340 KB gz.
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
4. **Adaptive Session 1 questions** — backend generates a question sequence pre-Session 1; advisor approves it; portal renders it as a guided pre-session form.

### Phase 3 success criteria

- Predictive band shown on report when model is at AUC ≥ 0.7 (gated by backend).
- Calibration UI used at least quarterly to draft new rubric versions.

---

## Phase 4 — Productisation (week 52+)

Aligned with backend Phase 4 (extracting Stage 1 as a SaaS).

### Frontend changes

1. **Embeddable assessment widget** — a versioned, sandboxed iframe / web component that 3rd-party orgs embed on their site:
   - Renders the intake form scoped to their `org_id`
   - Returns the published report via webhook + a tenant-specific portal URL
2. **Tenant admin UI** — separate Vercel project (`platform.viacerta.com`) for SaaS customers to manage their API keys, see usage, customise rubric (within whitelist), brand the embedded widget.
3. **White-label theming** — `packages/design-tokens` extended to support per-tenant color overrides via CSS variables; build pipeline produces tenant-specific CSS bundles.
4. **Multi-tenant routing on existing apps** — `app.viacerta.com/t/<org>/...` or a per-tenant subdomain; auth becomes tenant-aware.

### Phase 4 success criteria

- At least 3 third-party orgs onboarded with embedded widgets.
- Per-tenant theming working in production without code changes to `apps/portal` per-tenant.
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
| Audience leak via copy-pasted advisor type into portal | MVP | ESLint guard + bundle string check; reviewed in every PR |
| Bundle size creep beyond budgets | MVP+P2 | `size-limit` CI gate; routine code-splitting for heavy routes |
| Form schema drift between RHF zod and backend Pydantic | MVP | Schemas mirror backend names + constraints; periodic drift-audit |
| Refresh interceptor edge cases (tab focus + offline) | MVP | Tests in `packages/api-client/src/__tests__/refresh-interceptor.test.ts` |

## What good looks like at each phase

- **End of Phase 0**: a stranger can clone the repo and have both apps running with login flow in < 30 minutes.
- **End of MVP**: a real student goes through Stage 1 entirely in the system, an advisor uses the console daily, ops manages document verification without spreadsheets.
- **End of Phase 2**: 50 concurrent students managed across all 7 stages; calibration UI used weekly; ops dashboard makes data freshness obvious.
- **End of Phase 3**: predictive intelligence visible on reports; advisors trust it enough to act on it.
- **End of Phase 4**: assessment engine generates revenue independently of full-service consultancy.
