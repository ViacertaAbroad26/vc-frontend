# 14 — Deployment

> A single deployment from this repo — see [ADR-007](./ADR-007-single-app-merge.md)
> for why `apps/portal` and `apps/advisor` were merged into `apps/web`.

## Hosting target

- **`apps/web`** — Vercel (static + edge) OR CloudFront + S3. Both fine; pick one in ADR-001's review.
- **Storybook** (Phase 2 only) — internal-only host (Vercel preview behind IP allowlist).

`apps/web` is an SPA. No SSR. No edge functions. The browser fetches the bundle, gets a JWT from login, makes API calls, and routes between student/parent/advisor/internal surfaces based on the logged-in user's role.

## Domains

| App | Domain | Notes |
|---|---|---|
| Web | `app.viacerta.com` | Students, parents, advisors, and internal ops — one origin, role-based routing |
| Marketing | `viacerta.com` | Out of scope here — separate Next.js / Webflow site |
| API | `api.viacerta.com` | FastAPI backend |

CORS on the backend (set in `app/main.py`) allows exactly this one frontend origin, never `*`.

## Build pipeline

```bash
# at repo root
pnpm install --frozen-lockfile

# 1. Generate the merged API client types against staging or production OpenAPI URLs
BACKEND_URL=https://api-staging.viacerta.com \
  pnpm --filter @viacerta/api-client generate

# 2. Type-check + lint
pnpm -r typecheck
pnpm -r lint

# 3. Build
pnpm --filter @viacerta/web build
```

Build output:

```
apps/web/dist/      # single bundle, covering student/parent + advisor + internal routes
```

Verify on each build:

```bash
# Bundle size budget
pnpm --filter @viacerta/web size
```

Budgets (gzipped, set with headroom over the measured advisor+internal build) are defined in the `size-limit` field of `apps/web/package.json`:

| Chunk | Measured | Budget |
|---|---|---|
| main bundle (`index-*.js`) | ~118 kB | 150 kB |
| vendor bundle (`vendor-*.js`) | ~65 kB | 80 kB |
| query bundle (`query-*.js`) | ~13 kB | 20 kB |
| charts bundle (`charts-*.js`) | <1 kB | 5 kB |
| stylesheet (`index-*.css`) | ~5 kB | 10 kB |

The old per-audience "bundle leak" check (`scripts/check-portal-bundle.sh`) no longer applies — `apps/web`'s bundle legitimately contains both student-facing and advisor-facing code. Audience separation is enforced at runtime by `<RoleGate>` and at the data layer by the backend, not by what's present in the bundle. See ADR-007 for the tradeoff this accepts.

## Vercel config

One Vercel project. Settings:

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Root directory | `apps/web` |
| Build command | `cd ../.. && pnpm install && pnpm --filter @viacerta/api-client generate && pnpm --filter @viacerta/web build` |
| Output directory | `dist` |
| Install command | (empty — handled in build) |
| Node version | 20 |

Environment variables per environment (Production / Preview / Development):

```bash
VITE_API_BASE_URL=https://api.viacerta.com
VITE_SENTRY_DSN=<frontend dsn>
VITE_ENV=production
```

`vercel.json` (single SPA rewrite — every route falls through to `/`):

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.viacerta.com https://o0.ingest.sentry.io; font-src 'self' data:; frame-ancestors 'none'" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

The CSP is the security spine — note `connect-src` restricts API calls to exactly the backend + Sentry. No CDN script tags, no inline scripts.

## CloudFront + S3 alternative

If we'd rather keep everything inside AWS (India region):

```
ap-south-1
├── S3 bucket: app.viacerta.com           (apps/web dist)
├── CloudFront distribution                (TLS via ACM, edge cache)
└── WAF managed ruleset                    (bot protection, OWASP top 10)
```

CI pushes to S3 + invalidates CloudFront on each deploy:

```yaml
- name: Deploy web to S3
  run: |
    aws s3 sync apps/web/dist/ s3://app.viacerta.com/ \
      --delete \
      --cache-control "public, max-age=31536000, immutable" \
      --exclude index.html
    aws s3 cp apps/web/dist/index.html s3://app.viacerta.com/index.html \
      --cache-control "no-cache"
    aws cloudfront create-invalidation \
      --distribution-id $CF_DIST_ID --paths "/index.html" "/"
```

Header / CSP rules go in CloudFront Functions (single small JS function appended to viewer-response). Same CSP as above.

Pick CloudFront over Vercel when (a) compliance asks for full India-region traffic flow or (b) Vercel cost crosses CloudFront pricing meaningfully. MVP starts on Vercel for simplicity.

## CI workflow — `.github/workflows/deploy.yml`

```yaml
name: deploy
on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: false

jobs:
  staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 8 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile

      - name: Generate API types from staging backend
        run: pnpm --filter @viacerta/api-client generate
        env:
          BACKEND_URL: ${{ secrets.STAGING_BACKEND_URL }}

      - run: pnpm -r typecheck
      - run: pnpm -r lint
      - run: pnpm -r test
      - run: pnpm --filter @viacerta/web build

      - name: Deploy web (Vercel)
        run: pnpm dlx vercel --token=$VERCEL_TOKEN --prod --cwd apps/web --yes
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

  production:
    needs: staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.viacerta.com
    steps:
      # same shape but env: production + manual approval gate via GitHub environments
      ...
```

Production deploys require manual approval in GitHub Environments.

## Codegen against the right backend

Per environment the backend URL is different. Wrong URL = wrong types = compile errors. Setting is keyed to the deploy env:

| Env | `BACKEND_URL` |
|---|---|
| Local dev | `http://localhost:8000` |
| Staging | `https://api-staging.viacerta.com` |
| Production | `https://api.viacerta.com` |

`scripts/generate.ts` fetches `${BACKEND_URL}/openapi.json` and `${BACKEND_URL}/advisor/openapi.json`, merges both specs, and runs `openapi-typescript` once to produce `packages/api-client/src/generated/api.d.ts`.

Codegen runs in CI before build. The generated file is **committed** to the repo (see ADR-005, partially superseded by ADR-007). The CI build re-generates and checks for diff — if backend changed but the committed types didn't get updated, CI fails:

```yaml
- name: Verify committed types match backend
  run: |
    pnpm --filter @viacerta/api-client generate
    git diff --exit-code packages/api-client/src/generated/
```

This forces the engineer to commit regenerated types when either backend spec changes; nothing slips out of sync between deploys.

## Observability

| Concern | Tool |
|---|---|
| Frontend errors | Sentry — single project for `apps/web` |
| Performance / Core Web Vitals | Sentry Performance or Vercel Web Vitals dashboard |
| Real user monitoring | Sentry browser SDK with sampling at 10% (100% for errors) |
| Bundle size tracking | `size-limit` (`pnpm --filter @viacerta/web size`), fails if `apps/web` exceeds the per-chunk budgets in `package.json` — wire into CI as a required check |

`apps/web/src/main.tsx` initialises Sentry:

```tsx
import * as Sentry from '@sentry/react'

if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_ENV,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration({ maskAllText: true })],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.5,
  })
}
```

`maskAllText: true` is non-negotiable — student PII in replays is exactly the kind of thing DPDP says we don't want crossing borders, and the same bundle now also serves advisor sessions which see that PII directly.

## Cache strategy

| Asset | Cache-Control |
|---|---|
| `index.html` | `no-cache` |
| `assets/*.js`, `assets/*.css` | `public, max-age=31536000, immutable` |
| `assets/*.{png,svg,woff2}` | `public, max-age=31536000, immutable` |
| Service worker | (none — we don't ship one) |

Vite produces content-hashed filenames; `immutable` is safe and gives near-instant subsequent loads.

## Rollback

- **Vercel**: every deploy is a new immutable URL; "Promote to production" toggles which version `app.viacerta.com` points at. Rollback = promote the previous deployment from the dashboard.
- **CloudFront/S3**: keep N previous versions of each asset prefix; flip `index.html` to point at the desired manifest; invalidate.

In both cases, rollback is < 60 seconds.

## Pre-prod checklist (PR-template requirement)

- [ ] `pnpm install --frozen-lockfile` is reproducible
- [ ] `pnpm -r typecheck` passes
- [ ] `pnpm -r test` passes locally
- [ ] If backend OpenAPI changed (either spec), regenerated types are committed
- [ ] No new `console.log` left in production code (ESLint catches this in `--max-warnings 0`)
- [ ] `pnpm --filter @viacerta/web size` passes (bundle size within budget)
- [ ] CSP headers in `vercel.json` updated if a new third-party domain is contacted
- [ ] Any new advisor/internal route is wrapped in `<RoleGate allow={...}>` — there is no build-level backstop now (ADR-007)

## Cost estimate (year 1, single app)

| Item | $/month |
|---|---|
| Vercel — Pro plan, 1 project | 20 |
| Sentry — Team plan | 26 |
| CloudFront alternative (if chosen) — bandwidth + requests | 15–60 |
| Total | ~$45–105/mo |

Negligible compared to backend (`docs/13` in backend specs estimates ~$900–1,800/mo). Frontend cost is not a meaningful budget line at MVP scale.

## What's intentionally not deployed in MVP

| Item | Why deferred |
|---|---|
| Storybook | Component library too small to justify; revisit Phase 2 when `packages/ui` matures |
| Native mobile shell (Capacitor / React Native) | Responsive web covers all required interactions; MVP doesn't ship app stores |
| Edge functions | No SSR needed; auth lives in the SPA |
| Service worker / offline mode | Advisor needs an internet connection; offline would complicate state sync without benefit |
| Multi-region deployment | Single India edge is fine; users are 99% India-resident |
