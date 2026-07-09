# ViaCerta Frontend

React monorepo for the ViaCerta career-first study-abroad platform. A single app (`apps/web`, student + parent + advisor + internal ops, role-based routing) plus shared packages. Consumes the FastAPI backend at `http://localhost:8000` in dev. See [ADR-007](./ADR-007-single-app-merge.md) for why this is one app, not two.

## Quick start

```bash
# Prerequisites: Node 20, pnpm 8
nvm use
pnpm install

# Make sure the backend is running on :8000 first.
# Generate the typed API client from both of the backend's OpenAPI specs:
pnpm --filter @viacerta/api-client run generate

# Run the app
pnpm dev
# or:
pnpm --filter @viacerta/web dev      # http://localhost:5173
```

## What's where

| Path | Purpose |
|---|---|
| `CLAUDE.md` | Orchestration file for Claude Code — read first |
| `*.md` (root) | Specification docs (numbered) and ADRs |
| `apps/web/` | Single app: student + parent + advisor + internal ops |
| `packages/ui/` | Shared component library |
| `packages/api-client/` | Single generated typed client (merged OpenAPI specs) |
| `packages/design-tokens/` | Colors, typography, Tailwind preset |
| `packages/utils/` | Shared helpers, `AppRole`/`AuthUser` types, routes |

## Stack

- React 18 + TypeScript 5 (strict)
- Vite 5
- React Router 6
- TanStack Query v5 (server state)
- Zustand (client state)
- Tailwind 3 + shadcn/ui primitives
- react-hook-form + zod (forms)
- Recharts (visualization)
- Vitest + React Testing Library + MSW (tests)
- Playwright (e2e)

## Required env vars

`apps/web` reads from `.env.local` (gitignored). See `apps/web/.env.example`:

```dotenv
# apps/web/.env.example
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=ViaCerta
VITE_PARENT_FLOW_ENABLED=true
VITE_SENTRY_DSN=
```

## Scripts (root `package.json`)

```bash
pnpm dev                # run apps/web
pnpm build              # build apps/web
pnpm test               # vitest run across all packages
pnpm test:watch         # vitest watch
pnpm e2e                # playwright
pnpm lint               # eslint
pnpm typecheck          # tsc -b
pnpm generate-api       # regenerate API types from both backend OpenAPI specs
```

## Contributing

1. New screen → add a feature folder under `apps/web/src/features/`, then a thin route file. Advisor/internal routes must be wrapped in `<RoleGate allow={...}>` in `router.tsx` and added to `SideNav`.
2. New shared component → add to `packages/ui` with a test.
3. New API consumed → first verify it exists in `packages/api-client/src/generated/api.d.ts`; regenerate if needed.
4. New ADR for any architectural decision (`ADR-NNN-*.md` at repo root).

## License

Confidential.
