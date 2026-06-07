# 13 — Testing

> Three things deserve disproportionate investment: **audience separation** (no advisor field in portal bundle), **forms** (RHF + zod for every form, including server-error mapping), and **the Aditya happy-path e2e** mirroring the backend's regression test.

## Layers

```
        ┌──────────────────────────────────┐
        │  Playwright (apps/portal,       │  Aditya end-to-end across both apps
        │  apps/advisor, both apps in     │
        │  same test for cross-app flow)   │
        └──────────────────────────────────┘
       ┌──────────────────────────────────────┐
       │  Component tests (Vitest + RTL + MSW) │  per route + per feature
       └──────────────────────────────────────┘
   ┌──────────────────────────────────────────────┐
   │  Unit tests (Vitest)                          │  packages/utils, schemas, formatters
   └──────────────────────────────────────────────┘
```

Coverage targets:

| Path | Target |
|---|---|
| `packages/utils` | 95% |
| `packages/api-client` (the wrapper, not generated types) | 90% |
| `apps/*/src/features/**` | 85% |
| `apps/*/src/routes/**` | 80% |
| Audience-separation tests | exhaustive — every parent + student route |

## Vitest config

```ts
// apps/portal/vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'src/test/**', '**/*.config.*', '**/*.d.ts',
        'src/main.tsx', 'src/router.tsx',
      ],
      thresholds: {
        lines: 80, statements: 80, branches: 75, functions: 80,
      },
    },
  },
}))
```

`apps/advisor/vitest.config.ts` is identical; package vitest configs (where present) mirror.

## Setup file — `apps/portal/src/test/setup.ts`

```ts
import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './msw-server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  window.localStorage.clear()
})
afterAll(() => server.close())
```

## MSW server — `apps/portal/src/test/msw-server.ts`

```ts
import { setupServer } from 'msw/node'
import { handlers } from './msw-handlers'

export const server = setupServer(...handlers)
```

## MSW handlers — happy-path defaults that each test can override

```ts
// apps/portal/src/test/msw-handlers.ts
import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

export const handlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = await request.json() as any
    if (body.password === 'wrong') {
      return HttpResponse.json(
        { type: 'https://viacerta.dev/errors/invalid-credentials',
          title: 'Invalid credentials', status: 401, detail: '' },
        { status: 401 },
      )
    }
    return HttpResponse.json({
      user: { id: 'u1', email: body.email, fullName: 'Test', role: 'STUDENT', studentId: 's1' },
      tokens: { accessToken: 'access', refreshToken: 'refresh', accessExpiresIn: 900 },
    })
  }),

  http.get(`${API}/portal/students/me/journey`, () =>
    HttpResponse.json({
      studentId: 's1',
      currentStateCode: 'LEAD',
      history: ['LEAD'],
      gcss: null,
    }),
  ),

  http.get(`${API}/portal/students/me/intake/:id`, ({ params }) =>
    HttpResponse.json({
      submissionId: params.id, persona: 'FINAL_YEAR_UG',
      answers: {}, isComplete: false,
    }),
  ),

  http.get(`${API}/portal/intake-form`, ({ request }) => {
    const persona = new URL(request.url).searchParams.get('persona')
    return HttpResponse.json(sampleIntakeForm(persona ?? 'FINAL_YEAR_UG'))
  }),

  // ... handlers for documents, report, etc.
]

function sampleIntakeForm(persona: string) {
  // returns a small valid form definition for tests
  return {
    persona,
    questions: [
      {
        id: 'specific_career_goal',
        type: 'short_text',
        label: 'What is your specific career goal?',
        required: true,
      },
      // ...
    ],
  }
}
```

## Custom render wrapper — `apps/portal/src/test/render.tsx`

Wraps every component in a QueryClient + MemoryRouter so tests don't have to repeat boilerplate.

```tsx
import { ReactElement } from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

type Options = RenderOptions & {
  initialEntries?: string[]
  queryClient?: QueryClient
}

export function render(ui: ReactElement, opts: Options = {}) {
  const qc = opts.queryClient ?? new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return rtlRender(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={opts.initialEntries ?? ['/']}>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>,
    opts,
  )
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
```

## Critical test 1 — Audience separation (portal)

```tsx
// apps/portal/src/__tests__/audience-separation.test.tsx
import { http, HttpResponse } from 'msw'
import { server } from '@/test/msw-server'
import { render, screen, waitFor } from '@/test/render'
import { ReportPage } from '@/routes/ReportPage'

describe('student portal: report page never displays advisor fields', () => {
  beforeEach(() => {
    // Even if backend accidentally leaks them, the UI should never render them
    server.use(
      http.get('*/portal/students/me/report', () =>
        HttpResponse.json({
          publishedAt: '2026-06-01T10:00:00Z',
          executiveSummary: 'Aditya is broadly ready with specific gaps to close.',
          gcss: {
            final: 76, flag: 'YELLOW',
            dimensions: [
              { key: 'CAREER_CLARITY', label: 'Career Clarity', raw: 13, max: 20, advisorInsight: 'Strong goal clarity but...' },
            ],
          },
          gcri: [],
          roi: { totalProgramCost: 4000000, currency: 'INR', years: [], breakEvenYear: 4 },
          riskRegister: [{ risk: 'Visa policy shift', severity: 'MODERATE', mitigation: 'Backup plan in NL' }],
          ninetyDayPlan: [{ week: 1, focus: 'Job market research', actions: ['Read 5 destination-country reports'] }],
          pdfDownloadUrl: 'https://example.com/report.pdf',
          // ADD these — they should be ignored
          rubricVersionId: 'rv1',
          overrideDelta: 2,
          confidenceMultiplier: 0.93,
        }),
      ),
    )
  })

  it('does not render rubric version, override delta, or confidence multiplier', async () => {
    render(<ReportPage />)

    await waitFor(() => screen.getByText(/Aditya is broadly ready/))

    // confirm visible
    expect(screen.getByText('76')).toBeInTheDocument()
    expect(screen.getByText(/Career Clarity/)).toBeInTheDocument()

    // confirm absent
    expect(screen.queryByText(/rubric/i)).toBeNull()
    expect(screen.queryByText(/override/i)).toBeNull()
    expect(screen.queryByText(/confidence multiplier/i)).toBeNull()
    expect(screen.queryByText(/rv1/i)).toBeNull()
    expect(screen.queryByText(/L\d/)).toBeNull()    // evidence levels
  })
})
```

A stronger guarantee: **the portal bundle should not be able to import advisor types**. This is an ESLint check, not a runtime test:

```ts
// .eslintrc-no-cross-audience.js (excerpt — full config in docs/02-tech-stack.md)
// In apps/portal:
'no-restricted-imports': ['error', {
  patterns: [
    { group: ['@viacerta/api-client/advisor', '@viacerta/api-client/advisor/*'],
      message: 'Portal app cannot import advisor API types.' },
  ],
}]
```

A bundle-level check in CI (greps the portal dist for advisor-only enum strings):

```bash
# scripts/check-portal-bundle.sh
set -e
pnpm --filter portal build
if grep -r "SENIOR_ADVISOR\|overrideDelta\|rubric_version_id" apps/portal/dist/ ; then
  echo "FAIL: advisor-only strings found in portal bundle"
  exit 1
fi
echo "PASS: portal bundle is clean"
```

## Critical test 2 — Form validation (Override dialog)

```tsx
// apps/advisor/src/features/assessment/__tests__/OverrideDialog.test.tsx
import { render, screen, userEvent } from '@/test/render'
import { OverrideDialog } from '../OverrideDialog'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/msw-server'

const target = {
  dimension: 'CAREER_CLARITY',
  subKey: 'specific_career_goal',
  current: 2,
  max: 4,
  label: 'Specific Career Goal',
}

describe('OverrideDialog', () => {
  it('blocks submit when evidence < 10 characters', async () => {
    const user = userEvent.setup()
    render(<OverrideDialog studentId="s1" target={target} onClose={() => {}} />)

    await user.clear(screen.getByLabelText(/new raw/i))
    await user.type(screen.getByLabelText(/new raw/i), '3')
    await user.type(screen.getByLabelText(/evidence/i), 'short')

    expect(screen.getByRole('button', { name: /save override/i })).toBeDisabled()
  })

  it('blocks submit when new raw exceeds max', async () => {
    const user = userEvent.setup()
    render(<OverrideDialog studentId="s1" target={target} onClose={() => {}} />)

    await user.clear(screen.getByLabelText(/new raw/i))
    await user.type(screen.getByLabelText(/new raw/i), '5')
    await user.type(screen.getByLabelText(/evidence/i), 'Aditya named auto sector + Augsburg specifically in Session 1')

    await user.click(screen.getByRole('button', { name: /save override/i }))
    expect(await screen.findByText(/must be between 0 and 4/i)).toBeInTheDocument()
  })

  it('maps server field errors back to the form', async () => {
    server.use(
      http.post('*/advisor/students/:id/assessment/override', () =>
        HttpResponse.json({
          type: 'https://viacerta.dev/errors/validation',
          title: 'Validation failed', status: 422,
          extras: { fields: { evidenceNote: 'Evidence already used for another override' } },
        }, { status: 422 }),
      ),
    )

    const user = userEvent.setup()
    render(<OverrideDialog studentId="s1" target={target} onClose={() => {}} />)

    await user.clear(screen.getByLabelText(/new raw/i))
    await user.type(screen.getByLabelText(/new raw/i), '3')
    await user.type(screen.getByLabelText(/evidence/i), 'Aditya named auto sector + Augsburg specifically in Session 1')
    await user.click(screen.getByRole('button', { name: /save override/i }))

    expect(await screen.findByText(/already used for another override/i)).toBeInTheDocument()
  })
})
```

## Critical test 3 — Intake save-and-resume

```tsx
// apps/portal/src/features/intake/__tests__/IntakeForm.test.tsx
import { render, screen, userEvent, waitFor } from '@/test/render'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/msw-server'
import { IntakeFormPage } from '@/routes/IntakeFormPage'

describe('Intake form save-and-resume', () => {
  it('PATCHes the server with a debounce after typing', async () => {
    const patches: any[] = []
    server.use(
      http.patch('*/portal/students/me/intake/:id', async ({ request }) => {
        patches.push(await request.json())
        return HttpResponse.json({ ok: true })
      }),
    )

    const user = userEvent.setup({ delay: null })
    render(<IntakeFormPage />, { initialEntries: ['/intake/sub-1'] })

    await waitFor(() => screen.getByText(/Specific Career Goal/i))
    const input = screen.getByLabelText(/specific career goal/i)
    await user.type(input, 'Mechatronics & Automation Engineer')

    // Wait through debounce
    await new Promise((r) => setTimeout(r, 1700))

    expect(patches.length).toBeGreaterThanOrEqual(1)
    const last = patches.at(-1)!
    expect(last.answers.specific_career_goal).toContain('Mechatronics')
  })
})
```

## Critical test 4 — Refresh interceptor (single-flight)

```tsx
// packages/api-client/src/__tests__/refresh-interceptor.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { createPortalClient } from '../src/portal'

const server = setupServer()

describe('refresh interceptor', () => {
  beforeEach(() => server.resetHandlers())

  it('refreshes once for concurrent 401s, retries them all', async () => {
    let refreshes = 0
    server.use(
      http.post('*/auth/refresh', () => {
        refreshes++
        return HttpResponse.json({
          tokens: { accessToken: 'new', refreshToken: 'newref', accessExpiresIn: 900 },
          user: { id: 'u1', email: 'a@b.com', fullName: 'A', role: 'STUDENT', studentId: 's1' },
        })
      }),
      http.get('*/portal/students/me/journey', ({ request }) => {
        const auth = request.headers.get('authorization')
        if (auth === 'Bearer new') return HttpResponse.json({ ok: true })
        return HttpResponse.json({ type: 'auth', title: 'Token expired', status: 401 }, { status: 401 })
      }),
    )

    const client = createPortalClient()
    const [r1, r2, r3] = await Promise.all([
      client.GET('/portal/students/me/journey'),
      client.GET('/portal/students/me/journey'),
      client.GET('/portal/students/me/journey'),
    ])

    expect(refreshes).toBe(1)
    expect(r1.response.status).toBe(200)
    expect(r2.response.status).toBe(200)
    expect(r3.response.status).toBe(200)
  })

  it('on refresh failure: clears tokens + dispatches session-expired', async () => {
    server.use(
      http.post('*/auth/refresh', () =>
        HttpResponse.json({ type: 'auth', title: 'Reuse detected', status: 401 }, { status: 401 }),
      ),
      http.get('*/portal/students/me/journey', () =>
        HttpResponse.json({ type: 'auth', title: 'Token expired', status: 401 }, { status: 401 }),
      ),
    )

    const events: Event[] = []
    window.addEventListener('viacerta:session-expired', (e) => events.push(e))

    const client = createPortalClient()
    await expect(client.GET('/portal/students/me/journey')).rejects.toMatchObject({
      title: expect.stringMatching(/sign in/i),
    })
    expect(events).toHaveLength(1)
    expect(localStorage.getItem('vc.portal.accessToken')).toBeNull()
  })
})
```

## Playwright — Aditya happy-path e2e

`apps/portal/e2e/aditya-yellow.spec.ts`. Run against a staging backend with seeded data; or a containerised backend pinned to a fixture.

```ts
import { test, expect } from '@playwright/test'

test.describe('Aditya yellow journey', () => {
  test('registers, completes intake, sees pre-score, sees yellow report', async ({ page }) => {
    // 1. Register
    await page.goto('/register')
    await page.getByLabel('Full name').fill('Aditya Basu')
    await page.getByLabel('Email').fill(`aditya+${Date.now()}@test.com`)
    await page.getByLabel('Password', { exact: true }).fill('Strongpass1!')
    await page.getByLabel('Confirm password').fill('Strongpass1!')
    await page.getByLabel(/I agree/).check()
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page).toHaveURL('/')

    // 2. Persona + intake
    await page.getByRole('link', { name: /start intake/i }).click()
    await page.getByRole('button', { name: 'Choose' }).nth(1).click()    // FINAL_YEAR_UG

    // 3. Fill intake (a representative subset; full fixture in test/fixtures/aditya.ts)
    await page.getByLabel(/specific career goal/i).fill('Mechatronics & Automation Engineer')
    await page.getByLabel(/total budget/i).selectOption('30-50L')
    // ... ~30 more fields skipped here, see fixtures ...

    // 4. Submit
    await page.getByRole('button', { name: /submit intake/i }).click()
    await expect(page.getByText(/AI is pre-scoring/i)).toBeVisible()

    // 5. (test driver) Backend has mocked AI scorer that returns Aditya's anchors
    // Wait for journey to reach REPORT_BUILT (poll-driven)
    await expect(page.getByText(/Your report is ready/i)).toBeVisible({ timeout: 60_000 })

    // 6. Verify report
    await page.getByRole('link', { name: /view report/i }).click()
    await expect(page.getByText('76')).toBeVisible()
    await expect(page.getByText('Yellow')).toBeVisible()

    // 7. Audience separation — no advisor strings visible
    const text = await page.textContent('main')
    expect(text).not.toMatch(/override delta/i)
    expect(text).not.toMatch(/rubric version/i)
    expect(text).not.toMatch(/L[2-5]/)   // evidence levels not in portal
  })
})
```

## Playwright config

```ts
// apps/portal/playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: process.env.CI ? undefined : {
    command: 'pnpm dev',
    port: 5173,
    reuseExistingServer: true,
  },
})
```

`apps/advisor` mirrors with `port: 5174`.

## CI workflow — `.github/workflows/ci.yml`

```yaml
name: ci
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 8 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile

      - run: pnpm -r lint
      - run: pnpm -r typecheck
      - run: pnpm -r test --coverage

      - run: pnpm --filter portal build
      - run: pnpm --filter advisor build

      - name: Check portal bundle for advisor leaks
        run: ./scripts/check-portal-bundle.sh

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./apps/portal/coverage/lcov.info,./apps/advisor/coverage/lcov.info

  e2e:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 8 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm playwright install chromium
      - run: pnpm --filter portal exec playwright test
        env:
          PLAYWRIGHT_BASE_URL: ${{ secrets.STAGING_PORTAL_URL }}
      - run: pnpm --filter advisor exec playwright test
        env:
          PLAYWRIGHT_BASE_URL: ${{ secrets.STAGING_ADVISOR_URL }}
```

## What we don't test

- Recharts internals (component rendering only — that we pass the right data + colors).
- React Query internals (we test our hooks' contracts: invalidation keys, error handling).
- The generated `@viacerta/api-client/portal` and `/advisor` types (they come from backend `openapi.json`; a backend contract test owns this).
- Visual snapshots — too fragile; we test text + roles, not pixels.

## Test data fixtures

```ts
// apps/portal/src/test/fixtures/aditya.ts
export const ADITYA_INTAKE_ANSWERS = {
  specific_career_goal: 'Mechatronics & Automation Engineer',
  career_reality_knowledge: 'Robotics engineers in Germany work in auto, industrial...',
  why_specifically_abroad: 'Germany has the strongest manufacturing R&D...',
  job_market_research: '',    // intentionally weak — produces the 0/3
  plan_b: 'Domestic mechatronics role with Siemens India',
  total_budget: '30-50L',
  funding_method: 'family_funded + loan',
  expected_starting_salary: '€50,000-60,000',
  // ... ~30 fields; full set in this file
}

export const ADITYA_EXPECTED_GCSS = {
  raw: 76, final: 76, flag: 'YELLOW' as const,
}
```

Re-used across Vitest and Playwright. Single source of truth for what "Aditya" looks like in the frontend test suite — same fact set the backend's `tests/test_gcss_formula.py::test_aditya_basu_yellow_76` uses.
