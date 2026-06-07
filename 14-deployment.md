# 14 — Deployment

## Hosting target

- **Portal** (`apps/portal`) — Vercel (static + edge) OR CloudFront + S3. Both fine; pick one in ADR-001's review.
- **Advisor** (`apps/advisor`) — same host, **separate project**. Different domain (`advisor.viacerta.com` vs `app.viacerta.com`) reinforces audience separation at the URL level too.
- **Storybook** (Phase 2 only) — internal-only host (Vercel preview behind IP allowlist).

Both apps are SPAs. No SSR. No edge functions. The browser fetches the bundle, gets JWT from login, makes API calls.

## Domains

| App | Domain | Notes |
|---|---|---|
| Portal | `app.viacerta.com` | Students + parents |
| Advisor | `advisor.viacerta.com` | Advisors + ops + admin |
| Marketing | `viacerta.com` | Out of scope here — separate Next.js / Webflow site |
| API | `api.viacerta.com` | FastAPI backend |

CORS on the backend (set in `app/main.py`) allows exactly these two origins, never `*`.

## Build pipeline

Per app, the production build is:

```bash
# at repo root
pnpm install --frozen-lockfile

# 1. Generate API types against staging or production OpenAPI URL
PORTAL_OPENAPI_URL=https://api-staging.viacerta.com/openapi.json \
ADVISOR_OPENAPI_URL=https://api-staging.viacerta.com/advisor/openapi.json \
  pnpm --filter @viacerta/api-client generate

# 2. Type-check + lint
pnpm -r typecheck
pnpm -r lint

# 3. Build
pnpm --filter portal build
pnpm --filter advisor build
```

Build outputs:

```
apps/portal/dist/      # ~250 KB gzipped target
apps/advisor/dist/     # ~300 KB gzipped target (more features)
```

Verify on each build:

```bash
# Bundle size budget
du -sh apps/portal/dist/assets/index-*.js
du -sh apps/advisor/dist/assets/index-*.js

# Audience leak check
./scripts/check-portal-bundle.sh
```

## Vercel config — per app

Each app is a separate Vercel project. Settings:

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Root directory | `apps/portal` (or `apps/advisor`) |
| Build command | `cd ../.. && pnpm install && pnpm --filter @viacerta/api-client generate && pnpm --filter <app> build` |
| Output directory | `dist` |
| Install command | (empty — handled in build) |
| Node version | 20 |

Environment variables per environment (Production / Preview / Development):

```bash
VITE_API_BASE_URL=https://api.viacerta.com
VITE_TOKEN_STORAGE_KEY_PREFIX=vc.portal      # vc.advisor for advisor app
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
├── S3 bucket: app.viacerta.com           (portal dist)
├── S3 bucket: advisor.viacerta.com       (advisor dist)
├── CloudFront distribution per bucket    (TLS via ACM, edge cache)
└── WAF managed ruleset                   (bot protection, OWASP top 10)
```

CI pushes to S3 + invalidates CloudFront on each deploy:

```yaml
- name: Deploy portal to S3
  run: |
    aws s3 sync apps/portal/dist/ s3://app.viacerta.com/ \
      --delete \
      --cache-control "public, max-age=31536000, immutable" \
      --exclude index.html
    aws s3 cp apps/portal/dist/index.html s3://app.viacerta.com/index.html \
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
          PORTAL_OPENAPI_URL: ${{ secrets.STAGING_PORTAL_OPENAPI_URL }}
          ADVISOR_OPENAPI_URL: ${{ secrets.STAGING_ADVISOR_OPENAPI_URL }}

      - run: pnpm -r typecheck
      - run: pnpm -r lint
      - run: pnpm -r test
      - run: pnpm --filter portal build
      - run: pnpm --filter advisor build
      - run: ./scripts/check-portal-bundle.sh

      - name: Deploy portal (Vercel)
        run: pnpm dlx vercel --token=$VERCEL_TOKEN --prod --cwd apps/portal --yes
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID_PORTAL: ${{ secrets.VERCEL_PROJECT_ID_PORTAL }}

      - name: Deploy advisor (Vercel)
        run: pnpm dlx vercel --token=$VERCEL_TOKEN --prod --cwd apps/advisor --yes
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID_ADVISOR: ${{ secrets.VERCEL_PROJECT_ID_ADVISOR }}

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

Per environment the OpenAPI URL is different. Wrong URL = wrong types = compile errors. Setting is keyed to the deploy env:

| Env | `PORTAL_OPENAPI_URL` |
|---|---|
| Local dev | `http://localhost:8000/openapi.json` |
| Staging | `https://api-staging.viacerta.com/openapi.json` |
| Production | `https://api.viacerta.com/openapi.json` |

Codegen runs in CI before build. The generated file is **committed** to the repo (see ADR-005). The CI build re-generates and checks for diff — if backend changed but the committed types didn't get updated, CI fails:

```yaml
- name: Verify committed types match backend
  run: |
    pnpm --filter @viacerta/api-client generate
    git diff --exit-code packages/api-client/src/types/
```

This forces the engineer to commit regenerated types when the backend spec changes; nothing slips out of sync between deploys.

## Observability

| Concern | Tool |
|---|---|
| Frontend errors | Sentry — separate project per app, identifies portal vs advisor errors |
| Performance / Core Web Vitals | Sentry Performance or Vercel Web Vitals dashboard |
| Real user monitoring | Sentry browser SDK with sampling at 10% (100% for errors) |
| Bundle size tracking | `size-limit` CI check, fails PR if portal > 280 KB gz or advisor > 340 KB gz |

`apps/portal/src/main.tsx` initialises Sentry:

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

`maskAllText: true` is non-negotiable for the portal — student PII in replays is exactly the kind of thing DPDP says we don't want crossing borders.

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
- [ ] `scripts/check-portal-bundle.sh` passes locally
- [ ] If backend OpenAPI changed, regenerated types are committed
- [ ] No new `console.log` left in production code (ESLint catches this in `--max-warnings 0`)
- [ ] CSP headers in `vercel.json` updated if a new third-party domain is contacted
- [ ] Bundle size within budget (`size-limit` CI check)

## Cost estimate (year 1, two apps)

| Item | $/month |
|---|---|
| Vercel — Pro plan, 2 projects | 40 |
| Sentry — Team plan | 26 |
| CloudFront alternative (if chosen) — bandwidth + requests | 20–80 |
| Total | ~$65–150/mo |

Negligible compared to backend (`docs/13` in backend specs estimates ~$900–1,800/mo). Frontend cost is not a meaningful budget line at MVP scale.

## What's intentionally not deployed in MVP

| Item | Why deferred |
|---|---|
| Storybook | Component library too small to justify; revisit Phase 2 when `packages/ui` matures |
| Native mobile shell (Capacitor / React Native) | Responsive web covers all required interactions; MVP doesn't ship app stores |
| Edge functions | No SSR needed; auth lives in the SPA |
| Service worker / offline mode | Advisor needs an internet connection; offline would complicate state sync without benefit |
| Multi-region deployment | Single India edge is fine; users are 99% India-resident |
