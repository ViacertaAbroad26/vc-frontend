# ADR-005 — Generated OpenAPI Client (committed types, not runtime fetch)

**Status**: Accepted, partially superseded by [ADR-007](./ADR-007-single-app-merge.md)
**Date**: 2026-06-04
**Deciders**: Gautam (founder / eng lead)

> **2026-06-11 update**: The codegen rationale (commit generated types, CI
> diff-check against the live spec) still holds. However, the "two separate
> generated files / two clients" decision (the "Why two separate generated
> files, not one" section below) is reversed by ADR-007: `packages/api-client`
> now exports a single merged `paths` type and a single `apiClient` from one
> entry point (`@viacerta/api-client`), generated from both the portal and
> advisor OpenAPI specs merged together.

## Context

The backend is FastAPI; it produces two OpenAPI specs (`/openapi.json` for portal, `/advisor/openapi.json` for advisor). The frontend needs:

- Strongly-typed request bodies and response shapes for every endpoint
- Auto-detection when a backend contract changes
- Audience separation enforced at the type level (portal cannot reference advisor-only types)
- JWT auth + refresh interceptor + RFC 7807 error normalization across all calls
- A consistent place to add cross-cutting behavior (logging, retry, etc.) without touching call sites

## Decision

- **Codegen with `openapi-typescript`** — produces a `.d.ts` file per spec, no runtime code
- **Two generated files**: `packages/api-client/src/types/portal.d.ts` and `packages/api-client/src/types/advisor.d.ts`
- **Hand-written thin client** wrapping `axios` per audience: `portalClient`, `advisorClient`
- **Generated files are committed** to the repo (not generated at install time, not generated at build time only)
- **CI verifies** that committed types match the live OpenAPI spec (regenerate, fail on diff)

The generated client is used through openapi-fetch on top of our axios instance (see `docs/04`).

## Rationale

### Why generate from OpenAPI vs hand-writing types

- **Contract is the spec**, not the types. Backend changes a field, the spec changes, regenerate, frontend compiles or doesn't. The wrong way is "I noticed the API changed, let me update my TypeScript types" — humans miss fields.
- **Discriminated unions for error shapes**. OpenAPI 3.1 + Pydantic produces tagged unions in TS that pattern-match against `type` discriminator URIs. We get RFC 7807 errors as proper TS unions for free.
- **Path-typed clients**. `client.GET("/api/v1/portal/students/me/report")` autocompletes; passing the wrong path is a type error.

### Why `openapi-typescript` over alternatives

| Tool | Why not picked |
|---|---|
| `openapi-generator` | Code-heavy (generates classes, factories, models); slow; output is hard to read |
| `swagger-codegen` | Legacy; same critique |
| `orval` | Generates React Query hooks too — couples codegen to our state library choice. We prefer decoupled |
| `oazapfts` | Smaller community; we want stable tooling |
| Hand-written types | Drift; high friction to keep in sync |

`openapi-typescript` outputs a single `.d.ts` file: pure types, zero runtime. We layer our own thin wrapper on top. Total package weight stays small.

### Why commit generated files

- **Reproducible builds**. Anyone building the repo gets the exact same types without needing the backend running.
- **PR reviewers see the diff**. If a backend change deletes a field, the generated `.d.ts` diff is in the PR; reviewers can spot the breaking change in context.
- **Onboarding**. A new contributor's first `pnpm install && pnpm dev` works without the backend being available.
- **CI step that re-generates and fails on diff** ensures committed files don't drift from the live spec:
  ```yaml
  - run: pnpm --filter @viacerta/api-client generate
  - run: git diff --exit-code packages/api-client/src/types/
  ```

### Why two separate generated files, not one

This is the audience-separation pivot point.

- The portal app imports types from `@viacerta/api-client/portal` only.
- The advisor app imports from `@viacerta/api-client/advisor` only.
- ESLint forbids the wrong cross-import (`no-restricted-imports` rule).
- The portal's generated file *literally does not contain* `OverrideRequest`, `AdvisorAssessmentResponse`, `rubricVersionId`, etc. — they're not in `/openapi.json`.
- A leak therefore cannot pass the typecheck. The CI bundle string-check (`scripts/check-portal-bundle.sh`) is the second line of defence; the type system is the first.

### Why a thin hand-written client over fully-generated

The generated layer should be **types only**. Why:

- The interesting logic (refresh interceptor, error normalization, audience-specific base URL, token attachment) is cross-cutting and changes more slowly than the endpoint set. We don't want it regenerated.
- Different audiences need different storage keys (`vc.portal.accessToken` vs `vc.advisor.accessToken`); a generated client wouldn't know.
- The shared axios instance is reused by both clients (see `docs/04`). Generated code would duplicate this per spec.

The wrapper:

```ts
// packages/api-client/src/portal.ts
import createClient from 'openapi-fetch'
import type { paths } from './types/portal'        // generated
import { portalAxios } from './shared/axios'

export const portalClient = createClient<paths>({
  baseUrl: env.VITE_API_BASE_URL,
  fetch: (url, init) => portalAxios.fetch(url, init),
})
```

`openapi-fetch` is a small (~3 KB) wrapper that uses the generated paths type to make `.GET`, `.POST`, `.PATCH` calls fully type-checked. Path params, query params, request body, response shape — all typed.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **Hand-written types** | Drift, no enforcement, manual labor |
| **GraphQL + GraphQL Code Generator** | Backend is REST + OpenAPI; switching to GraphQL is a massive change for no marginal value |
| **tRPC** | Backend is Python; tRPC is TypeScript-only |
| **Generate at install time** | First clone fails if backend is down; opaque CI failures |
| **Generate at build time only** | Same problem; reviewers can't see contract diffs in PR |
| **Don't generate, just use `axios` with `any`** | Loses every type benefit; defeats the point of TypeScript |

## Consequences

### Positive

- A backend change that breaks contract is a TypeScript error in CI, immediate.
- Audience separation is enforced by the type system, not by convention.
- Adding a new endpoint requires zero frontend code beyond the generated update — `portalClient.GET("/...")` autocompletes.
- The wrapper layer (refresh, errors) is small, owned, and stable.

### Negative

- Backend devs need to keep the OpenAPI spec clean (no untyped `dict` returns, no missing response models). FastAPI defaults make this easy but worth flagging.
- The generated files are large (~thousands of lines per spec). They're not human-friendly; reviewers should look at the diff summary, not the full content.
- Codegen requires the backend OpenAPI spec URL — local development needs the backend running on `localhost:8000` for first `generate` run (committed types make subsequent dev work even when backend is down).

### Risks worth naming

- **Spec quality**. If FastAPI returns a response type that's not properly typed (e.g., raw `dict`), the generated TS type will be `Record<string, unknown>` — much weaker than expected. Mitigation: backend convention requires every endpoint to declare `response_model=...`.
- **Polymorphic responses**. OpenAPI 3.1 + Pydantic discriminated unions work, but more exotic schemas (anyOf without discriminator) generate awkward union types. Mitigation: convention to keep response shapes simple.

## When to revisit

- If the backend adds a streaming endpoint (SSE / websockets), codegen doesn't help there; we'd write that integration by hand inside the api-client package.
- If we switch to a different backend stack post-Phase 4 (unlikely), the codegen approach generalises to any OpenAPI 3.x emitter.

## Follow-ups

- `docs/04-api-client.md` is the operational guide; this ADR is the rationale.
- The CI gate verifying committed types match live spec (`docs/14`) is the single most important guardrail enforcing this ADR — if it ever flakes, fix it before accepting the flake as routine.
