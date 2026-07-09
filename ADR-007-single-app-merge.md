# ADR-007 — Merge `apps/portal` and `apps/advisor` into a single `apps/web`

**Status**: Accepted
**Date**: 2026-06-11
**Deciders**: Gautam (founder / eng lead)

## Context

ADR-002 set up two separate React apps (`apps/portal` for STUDENT/PARENT,
`apps/advisor` for advisor + internal-ops roles), each with its own build,
deploy target, and generated API client (ADR-005), in order to enforce
audience separation at the bundle level.

In practice, this means **two separate frontend deployments from one repo**
(`app.viacerta.com` and `advisor.viacerta.com`). At the current stage, that
is more deployment surface area than the team wants to operate: two Vercel
(or equivalent) projects, two sets of environment variables, two build
pipelines to keep green, for what is still a small product.

The explicit requirement driving this change: **ship one deployable frontend
from this repo**, not two.

## Decision

Merge `apps/portal` and `apps/advisor` into a single app, `apps/web`:

- One Vite app, one `index.html`, one build, one deploy target.
- One React Router instance (`src/router.tsx`) with role-based routing:
  student/parent routes, advisor routes (wrapped in `<RoleGate>`), and
  internal-ops routes (wrapped in `<RoleGate>`) all live in the same route
  tree.
- One combined role union in `@viacerta/utils`:
  `AppRole = PortalRole | AdvisorRole`, where `PortalRole = "STUDENT" |
  "PARENT"` and `AdvisorRole` covers the 8 advisor/internal roles.
- One `@viacerta/api-client` entry point (`@viacerta/api-client`), generated
  from both OpenAPI specs merged together (`scripts/generate.ts` fetches
  `/openapi.json` and `/advisor/openapi.json` and merges `paths` +
  `components.schemas`).
- One auth store, one `authStorage` namespace (`viacerta:access` /
  `viacerta:refresh`), one refresh interceptor, one `viacerta:session-expired`
  event.
- A single `<HomePage>` at `/` that renders the student dashboard for
  STUDENT (and unauthenticated) users, and redirects everyone else to their
  role's landing page via `destinationByRole(role, studentId)`.
- `<SideNav>` and `<TopBar>` render the union of nav items, filtered per-user
  by role group (`@/lib/roles`).

`apps/advisor` is deleted. `packages/api-client/src/{portal,advisor}.ts` and
`src/generated/{portal,advisor}.d.ts` are deleted in favor of
`src/index.ts` and `src/generated/api.d.ts`.

## Rationale

### Audience separation is no longer enforced at the bundle level

ADR-002's core argument — a student's bundle should not even *contain*
advisor-only types/components — is explicitly given up here. After this
change:

- The `apps/web` bundle contains both student-facing and advisor-facing
  code, types, and route definitions (code-split per-route via React
  Router's lazy loading where it matters for bundle size, but all reachable
  from the same origin).
- Audience separation becomes a **runtime** property: `<ProtectedRoute>` +
  `<RoleGate>` gate access to advisor/internal routes, and `<SideNav>` hides
  links a user can't use. A student who inspects the bundle could see
  advisor field names and route shapes that were previously impossible to
  ship to them.

This is a real regression against ADR-002's stated goal, accepted
deliberately because:

- **One deploy beats build-level isolation at this stage.** The team does
  not want to operate two deployments from one repo. A single Vercel
  project, single domain, single set of env vars is worth more right now
  than the bundle-level guarantee.
- **The backend remains the actual security boundary.** Advisor-only
  *data* is still gated by the backend's two OpenAPI specs and auth checks —
  a student's JWT cannot call `/api/v1/advisor/*` regardless of what's in
  the frontend bundle. The frontend-bundle isolation was defense-in-depth on
  top of that, not the primary control. Losing it raises the cost of a
  determined bundle-inspection attacker slightly, but does not expose any
  data a correctly-implemented backend wouldn't already protect.
- **Team size.** At two-person scale, maintaining two Vite configs, two
  `package.json`s, two CI bundle-size budgets, and two deploy pipelines is
  overhead that isn't paying for itself yet.

### One API client entry point

ADR-005's "two generated files, two clients" design existed specifically to
make the bundle-level isolation in ADR-002 enforceable by the type system.
With ADR-002 reversed, maintaining two clients (and two `AuthUser` shapes,
two `authStorage` namespaces, two refresh-interceptor instances) adds
complexity with no corresponding benefit — `apps/web` needs both portal and
advisor endpoints in the same app anyway.

The merged `scripts/generate.ts` fetches both specs and spread-merges
`paths` and `components.schemas` into one object before running
`openapi-typescript`. If the two specs ever define a schema with the same
name but different shapes, the later spread wins silently — **this is a
known sharp edge**; if it becomes a real problem, the fix is to namespace
colliding schema names before merging, not to revert to two files.

### Single auth store / single role union

`AppRole = PortalRole | AdvisorRole` and a single `AuthUser.role: AppRole`
mean every place that previously had to know "which app am I in" now just
checks the role directly. `destinationByRole()` centralizes the
role → landing-route mapping that used to be implicit in "which app did you
log into".

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **Keep two apps, one Vercel project with path-based routing/rewrites** | Still two builds, two `package.json`s to keep in sync, two CI lint/typecheck/test runs — most of ADR-002's maintenance cost without the one-deploy simplicity the user actually wants |
| **Keep two apps, deploy only `apps/portal`, retire `apps/advisor` UI for now** | Advisor/internal users need a working UI now; not actually on the table |
| **Single app, but lazy-load advisor route chunks behind a separate sub-bundle and keep two generated API clients** | Partial middle ground, but doesn't reduce the "two clients / two role types / two auth stores" maintenance burden that was the bigger source of duplication; the deploy-count requirement is the binding constraint, not bundle size |

## Consequences

### Positive

- **One build, one deploy, one domain, one set of env vars.** Directly
  satisfies the stated requirement.
- Less duplication: one `AuthUser`/`AppRole` type, one `authStorage`, one
  refresh interceptor, one `routes` object, one API client.
- Simpler onboarding: `pnpm install && pnpm --filter @viacerta/web dev` is
  the only frontend dev server.
- Internal-ops and advisor screens and student/parent screens can share
  layout primitives (`AppShell`, `SideNav`, `TopBar`) and navigate between
  each other within one router (useful once advisors start linking directly
  to student-facing pages, etc.).

### Negative

- **Bundle-level audience isolation is gone.** See "Rationale" above — this
  is the main tradeoff and is accepted, not accidental.
- `apps/web`'s bundle is larger than `apps/portal` alone was. Code-splitting
  advisor/internal routes via `React.lazy()` is recommended as a follow-up
  if bundle size becomes a concern (not yet measured).
- The merged OpenAPI generation step (`scripts/generate.ts`) has the schema-
  collision sharp edge noted above.
- CLAUDE.md's "Two apps, not one" section, ADR-002, ADR-005, and
  `docs/01-project-structure.md` / `docs/14-deployment.md` all described the
  old two-app layout and need updating (tracked alongside this ADR).

### Tradeoffs we accept

- Role-based runtime gating (`RoleGate`, `ProtectedRoute`, role-filtered
  `SideNav`) is now the *only* audience-separation control on the frontend.
  If a `RoleGate` is missing or misconfigured on a new advisor route, there
  is no build-level backstop — code review and tests are the safety net.

## Follow-ups

- If the product reaches a scale where two deploy pipelines are acceptable
  again (e.g. a dedicated DevOps setup, or advisor traffic growing enough to
  want independent scaling/release cadence), revisit this ADR. The merge is
  structured so that splitting `apps/web`'s route tree back into two apps is
  mechanical (the role-gated route groups are already delineated in
  `router.tsx`), but the API client and shared types would need to be
  re-split too.
- Consider `React.lazy()` code-splitting for `/cases`, `/students/:id/*`,
  `/calibration`, and the internal-ops routes once bundle size is measured.
- If schema-name collisions ever appear in the merged OpenAPI types, fix by
  namespacing in `scripts/generate.ts` rather than reverting to two clients.
