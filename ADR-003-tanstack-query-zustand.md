# ADR-003 — TanStack Query + Zustand (No Redux)

**Status**: Accepted
**Date**: 2026-06-04
**Deciders**: Gautam (founder / eng lead)

## Context

The frontend has two distinct kinds of state:

1. **Server state**: assessments, reports, journey, case queue, audit trail. Lives in MongoDB. Stale by nature. Mutations have RFC 7807 error shapes. Audience-filtered. Frequently polled.
2. **Client state**: current user + token, intake save-and-resume buffer, dialog open/closed, filter URL params, form fields.

We need: clear separation of these, no surprise re-renders, no manual cache plumbing for server data, no boilerplate for the small amount of client state we have.

## Decision

- **Server state** — **TanStack Query v5** (React Query). One hook per resource (`useJourney`, `useStudentReport`, `useAdvisorCases`, etc.) in `apps/*/src/hooks/`.
- **Client state** — **Zustand 4** for the few stores we genuinely need (`auth-store`, `intake-store`); plain `useState` for everything component-local; `useSearchParams` for URL-encoded filters.
- **Forms** — react-hook-form (see ADR-006), not part of this state system.

No Redux, no Redux Toolkit, no Recoil, no Jotai, no React Context for app state.

## Rationale

### Why TanStack Query for server state

- **Cache-keyed reads + automatic refetch on mutation** is exactly the contract a client of a REST API wants. We never write `setState` for server data; we invalidate cache keys.
- **Polling primitives built in**. The portal's `useJourney` polls every 10s when the state is `INTAKE_COMPLETE` or `AI_PRESCORED` (see `docs/06`). The advisor case queue polls every 30s while focused. This is one config object per hook, not a custom hook of `setInterval` + manual cancellation.
- **4xx → no retry** is the right default for our backend's error shape. Configured once in `QueryClient`.
- **Optimistic updates** with rollback (used for GCSS override — see `docs/06`) are first-class.
- **Devtools** are excellent and replace what Redux DevTools provided for server state.
- **Suspense-compatible** when we want to opt in.

### Why Zustand for the small amount of client state

- **No Provider**. A `useAuthStore()` hook works from anywhere — no `<AuthProvider>` wrapping the tree, no re-render storm when the user changes.
- **Selectors** — `useAuthStore((s) => s.user.role)` re-renders only when the role changes. Built-in, no `reselect` needed.
- **Tiny** — ~1 KB gzipped.
- **Simple mental model** — a store is a single object with mutator functions; you call `set()`, subscribers update. No reducers, no action types, no middleware unless you opt in.

The two stores we actually need:

| Store | Why |
|---|---|
| `auth-store` | Current user + token must be globally available; React Query is the wrong place for this |
| `intake-store` | Save-and-resume buffer for intake answers; lives outside React Query because it's pre-commit state, not server state |

Everything else lives in `useState` (dialog open/closed, local toggles) or `useSearchParams` (filters that should survive a refresh + share via URL).

### Why we explicitly rejected Redux Toolkit

Redux Toolkit is excellent at what it does. It's not what we need:

- **Server state isn't its strength**. RTK Query is a server-state layer bolted onto Redux; TanStack Query is purpose-built for this and has more momentum.
- **Boilerplate-to-value ratio is poor for our client state**. We have ~3 pieces of global client state. Redux Toolkit asks for slices, reducers, selectors, store config, dispatch types — a lot of machinery for `setUser` + `setIntakeBuffer`.
- **Mental tax**. Action types, dispatching, middleware behavior, persistence config — all are concepts a new contributor has to learn before they can land a feature. Zustand needs ~10 minutes of reading.

### Why not Context for app state

- **Re-render fanout**. Putting `user` in a context re-renders every consumer when *any* user field changes. Zustand selectors avoid this.
- **Composability hurts**. Multiple contexts → nested providers → noisy `App.tsx`. Hooks are flatter.

Context is fine for **dependency injection of stable values** (theme tokens, feature flags). It's not what we want for mutable application state.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **Redux Toolkit + RTK Query** | RTK Query is fine; the rest of Redux is overhead we don't need at our state shape |
| **Recoil** | Atomic state model is elegant; ecosystem is smaller and momentum has stalled |
| **Jotai** | Similar shape to Zustand; we'd pick one — Zustand is more familiar |
| **MobX** | Reactivity model is great; the team isn't on it, and the conceptual jump isn't worth it for our state needs |
| **SWR** | A close cousin to TanStack Query; TanStack Query is more featured (mutations, optimistic UI, query devtools, infinite queries) |
| **Context everywhere** | Re-render storms + provider nesting; not viable |

## Consequences

### Positive

- Server-state code is uniform: one file per query/mutation, predictable invalidation pattern.
- Client-state code is so small it doesn't even show up on the radar — exactly right.
- New contributor onboarding is short: "server data goes through React Query; auth + intake buffer are in Zustand stores; forms use react-hook-form."

### Negative

- Two state libraries in the stack instead of one. Mitigated by the clear "server vs. client" rule — there's never ambiguity about which to use.
- TanStack Query's defaults can surprise (`staleTime: 0` by default makes everything refetch on focus). We override these in `lib/query-client.ts` (`docs/06`).

### When to revisit

- If our cross-component client state grows past ~5 stores or starts having complex interactions (rare), we'd consider whether Redux Toolkit or XState makes sense.
- If we add multi-user real-time collaboration (Phase 4), the state model changes substantially and this ADR is revisited.

## Follow-ups

- `docs/06-state-management.md` is the canonical "how to add a query/mutation/store" guide; this ADR is the "why".
- A separate ADR-006 covers forms — they're their own state world that doesn't go through either library above.
