# ADR-001 — Vite SPA over Next.js

**Status**: Accepted
**Date**: 2026-06-04
**Deciders**: Gautam (founder / eng lead)

## Context

The frontend serves two audiences (portal for students/parents, advisor console for advisors and internal ops) backed by a Python/FastAPI backend that owns all business logic and produces OpenAPI specs. The product is a decision-support workflow tool used by signed-in users — not a marketing site, not a content site, not a discovery surface.

We need: typed end-to-end contracts, fast dev iteration, audience separation enforced at the build level, and a clean story for hosting in India.

## Decision

Use **Vite 5** to build the app as a **client-side SPA**. No SSR, no edge functions, no Next.js framework. ~~Two separate Vite projects (`apps/portal`, `apps/advisor`)~~ — as of [ADR-007](./ADR-007-single-app-merge.md), a single Vite project (`apps/web`) inside one pnpm monorepo (`docs/01`). The Vite-not-Next.js decision itself is unaffected.

## Rationale

### What an SPA gives us that we actually need

- **Trivial mental model**: HTML shell → JS bundle → React renders → API calls → backend. There is no second runtime to debug.
- **No server cold starts**, no per-request rendering cost, no edge-function quota to worry about.
- **Authenticated-only routes**: every meaningful screen requires a JWT. Pre-rendering them as HTML is wasted work.
- **Audience separation at the bundle level**: two independent Vite builds is concrete and verifiable (`scripts/check-portal-bundle.sh`). With Next.js you'd either fight the framework's routing assumptions or accept that "audience separation" becomes a runtime convention.

### What Next.js offers that we don't need

| Next.js feature | Why we don't need it |
|---|---|
| Server components | All our data is per-user and JWT-gated; nothing pre-renders meaningfully |
| `getServerSideProps` / route handlers | Backend already speaks OpenAPI; there's no SSR data layer worth duplicating |
| Image optimisation | Asset count is tiny (icons + a few SVGs); CDN handles it |
| Route-based code splitting | Vite + React.lazy gives us this without buying into the file-system router |
| API routes | Backend is its own service; we don't want any business logic on the frontend host |
| Middleware (edge auth) | JWT verification + refresh interceptor lives in `@viacerta/api-client`, runs in the browser, talks to the backend |

The Next.js bundle starts pulling in framework code (React Server Components runtime, router internals) that adds weight without delivering value for our shape.

### What Vite gives us

- **ESBuild** dev server: typing → reload feels instant.
- **Library mode** is available if we ever extract `packages/ui` for publishing.
- **`openapi-typescript` integration trivially**: a script reads the FastAPI spec, writes a `.d.ts`, and the rest is types-as-truth.
- **Vite plugin ecosystem** is small but covers everything we need (React, Tailwind via PostCSS, SVGR if needed).

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **Next.js (Pages or App Router)** | Framework features address problems we don't have; adds runtime + deployment complexity |
| **Remix** | SSR + nested routing is the wrong shape for a fully-authenticated SPA |
| **Create React App** | Effectively deprecated; ESBuild-era tooling makes CRA's webpack feel slow |
| **Astro** | Content-site framework; wrong fit for a stateful tool |
| **SvelteKit / Vue** | Team familiarity skews React; backend type generation via openapi-typescript is JS-stack-agnostic but the React ecosystem (TanStack Query, Radix, RHF) is what we know |
| **Turbopack / Rspack** | Vite is fast enough and stable; switching for ~10% build speed isn't worth it now |

## Consequences

### Positive

- Two independent builds produce cleanly audience-separated bundles.
- Dev loop is tight (HMR-driven).
- Hosting story is the simplest possible: static files behind a CDN.
- No vendor lock-in beyond Vite itself.

### Negative

- We don't get free SSR if we ever want a marketing-ish public surface inside the same app. Mitigation: marketing lives at `viacerta.com` as a separate site.
- First contentful paint is dictated by JS bundle parse time; Lighthouse Performance is harder to maintain than for a pre-rendered site. Budget enforced via `size-limit` CI gate.
- SEO is nonexistent — but our app is authenticated and behind login, so SEO is N/A by design.

## Follow-ups

- If we add a public landing/marketing inside this repo, revisit with a small Astro project alongside (don't bring Next.js into the mix retroactively).
- If Phase 4 (productisation) brings public embedding, the embedded widget is a separate Vite build, not an SSR concern.
