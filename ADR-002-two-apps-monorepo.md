# ADR-002 — Two Apps in a Monorepo

**Status**: Accepted
**Date**: 2026-06-04
**Deciders**: Gautam (founder / eng lead)

## Context

The backend serves two distinct OpenAPI specs (`/openapi.json` for the portal audience, `/advisor/openapi.json` for the advisor audience) with deliberately different shapes. Audience separation is one of the system's non-negotiable properties: a student must never be able to see advisor-only fields, even by URL guessing or DOM inspection.

The question for the frontend is: one app with role-based UI gating, or two apps?

## Decision

Two separate React applications inside one pnpm monorepo:

- `apps/portal` — for STUDENT + PARENT roles, deployed at `app.viacerta.com`
- `apps/advisor` — for ADVISOR + SENIOR_ADVISOR + COORDINATOR + APPS_OPS + VISA_OPS + CAREER_SERVICES + DATA_OPS + ADMIN roles, deployed at `advisor.viacerta.com`

Shared components, types, design tokens, and utilities live in `packages/*`. ESLint and a bundle string-check forbid the portal app from importing anything from the advisor API client, and vice versa.

## Rationale

### One-app + role-gating fails the audience-separation requirement

If both audiences ship in the same bundle, the JS contains advisor-only types, component code, and route definitions. A determined student inspecting the bundle would see field names like `overrideDelta`, `confidenceMultiplier`, `rubricVersionId`, and the source-level intent of advisor screens — even if the runtime hides them.

We cannot enforce "no advisor field visible to students" purely at runtime. It has to be enforced at the build level. The simplest, most concrete way is two builds.

### What this buys us

- **Two `openapi-typescript`-generated type files**, one per app. The portal's bundle literally cannot reference `AdvisorAssessmentResponse` because the type doesn't exist in its compilation graph.
- **Independent bundle size budgets**. Portal target < 280 KB gz; advisor < 340 KB gz. Mixing them would conflate budgets and hide regressions.
- **Independent deploy cadence**. Advisor app can ship a bug fix without touching the portal.
- **Domain-level audience cue**. The URL alone (`advisor.viacerta.com`) tells a student "you're not supposed to be here". Bookmarks, sharing, support tickets — all benefit.
- **CI guardrail surface area**. `scripts/check-portal-bundle.sh` greps the built portal dist for advisor-only strings; trivial to maintain.

### Why monorepo (vs two separate repos)

- **Shared `packages/ui`, `packages/design-tokens`, `packages/utils`, `packages/api-client`**: all four packages serve both apps. Two repos would mean publishing to a private registry or git-submodule gymnastics — heavy for a two-person change.
- **Atomic cross-cutting changes**: bumping the `Button` component + updating its usage in both apps lands in a single PR with one CI run.
- **Single contributor onboarding**: clone, install, dev — both apps boot side-by-side.

pnpm workspaces are the right size for this — lighter than Nx or Turborepo's full machinery, sufficient for the cross-package linking we actually need.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **Single SPA with role-based routing** | Fails audience-separation at the bundle level; relies on runtime convention |
| **Two repos, no shared packages** | Forces UI duplication or private npm publishing; high friction for a small team |
| **Nx monorepo** | Powerful but overkill; we don't need affected-only builds at our size, and pnpm workspaces give us 90% of the same value |
| **Turborepo** | Same as Nx — useful at higher scale; revisit if cross-package builds become slow |
| **Single Vite project with two entries** | Possible (multi-page Vite), but `manualChunks` cannot guarantee strict isolation; ESLint and bundle string-check still needed; net gain is small |
| **Three apps (separate parent surface)** | Parent surface is too small to justify; lives inside portal app at `/parent/*` with API-level audience filtering on the backend |

## Consequences

### Positive

- Audience separation has a concrete, verifiable enforcement story.
- Each app's complexity scales independently.
- ESLint + CI bundle check is the single most valuable architectural rule we own.

### Negative

- Two `package.json` files per app; bumping React or Vite means updating both.
- Two Vite configs to keep in sync (mostly identical via shared base — see `docs/02`).
- Local dev requires running both Vite servers if testing cross-app flows; mitigated by `pnpm dev` at the root which runs both in parallel.
- Shared component changes require a republish-equivalent (just an internal `workspace:*` link — automatic but worth noting).

### Tradeoffs we accept

- The internal-ops surfaces (LeadsPage, DocumentVerificationPage, DataOpsPage, OutcomesPage, UsersPage) live inside `apps/advisor` rather than getting their own app. Pragmatic — they share auth, layout, and component conventions with the advisor surface; splitting them adds little. Role-gating inside the advisor app is sufficient for advisor-vs-coordinator separation; the high-stakes separation is student-vs-advisor, and that's the boundary we drew.

## Follow-ups

- If Phase 4 productisation introduces an embeddable widget for third-party orgs, that's a third app (`apps/embed` or similar), not a hidden mode inside portal. Same rationale: build-level isolation > runtime convention.
- The `scripts/check-portal-bundle.sh` check graduates from "shell grep" to a proper AST-aware tool if it ever produces a false positive.
