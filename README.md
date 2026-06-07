# ViaCerta Frontend

React monorepo for the ViaCerta career-first study-abroad platform. Two apps (portal + advisor) plus shared packages. Consumes the FastAPI backend at `http://localhost:8000` in dev.

## Quick start

```bash
# Prerequisites: Node 20, pnpm 8
nvm use
pnpm install

# Make sure the backend is running on :8000 first.
# Generate typed API clients from backend's OpenAPI specs:
pnpm --filter @viacerta/api-client run generate

# Run both apps in parallel
pnpm dev

# or just one:
pnpm --filter @viacerta/portal dev      # http://localhost:5173
pnpm --filter @viacerta/advisor dev     # http://localhost:5174
```

## What's where

| Path | Purpose |
|---|---|
| `CLAUDE.md` | Orchestration file for Claude Code — read first |
| `docs/` | Specification |
| `adrs/` | Architectural Decision Records |
| `apps/portal/` | Student + parent app |
| `apps/advisor/` | Advisor + internal ops app |
| `packages/ui/` | Shared component library |
| `packages/api-client/` | Generated typed clients (one per audience) |
| `packages/design-tokens/` | Colors, typography, Tailwind preset |
| `packages/utils/` | Shared helpers |

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

Each app reads from `.env.local` (gitignored). See `.env.example` per app:

```dotenv
# apps/portal/.env.example
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=ViaCerta Portal

# apps/advisor/.env.example
VITE_API_BASE_URL=http://localhost:8000/advisor
VITE_APP_NAME=ViaCerta Advisor
```

## Scripts (root `package.json`)

```bash
pnpm dev                # run both apps
pnpm build              # build both apps
pnpm test               # vitest run across all packages
pnpm test:watch         # vitest watch
pnpm e2e                # playwright
pnpm lint               # eslint
pnpm typecheck          # tsc -b
pnpm generate-api       # regenerate API types from backend OpenAPI
```

## Contributing

1. New screen → add a feature folder under `apps/<app>/src/features/`, then a thin route file.
2. New shared component → add to `packages/ui` with a test.
3. New API consumed → first verify it exists in `packages/api-client/src/generated/`; regenerate if needed.
4. New ADR for any architectural decision in `adrs/`.

## License

Confidential.
