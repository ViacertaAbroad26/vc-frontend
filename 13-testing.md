# 13 — Testing

> Three things deserve disproportionate investment: **role-gating** (no advisor/internal route reachable by a student or unauthenticated user), **forms** (RHF + zod for every form, including server-error mapping), and **the Aditya happy-path e2e** mirroring the backend's regression test.

## Layers

```
        ┌──────────────────────────────────┐
        │  Playwright (@viacerta/web-e2e)   │  Aditya end-to-end + advisor/internal flows,
        │  one app, one base URL            │  one or more "projects" by auth role
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
| `apps/web/src/features/**` | 85% |
| `apps/web/src/routes/**` | 80% |
| Role-gating tests (`<RoleGate>` / `<ProtectedRoute>`) | exhaustive — every advisor + internal route, plus unauthenticated access to every protected route |

## Vitest config

```ts
// apps/web/vitest.config.ts
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

One Vite app, one Vitest config. Package-level vitest configs (`packages/*`) mirror the shape of `coverage` settings but run against each package's own `src/`.

## Setup file — `apps/web/src/test/setup.ts`

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

This is the only file under `apps/web/src/test/` that exists in the repo so far. The rest of this section describes the intended layout for the files referenced below (`msw-server.ts`, `msw-handlers/`, `render.tsx`, `fixtures/`) — add them as the corresponding tests are written, following `docs/01-project-structure.md`.

## MSW server — `apps/web/src/test/msw-server.ts`

```ts
import { setupServer } from 'msw/node'
import { handlers } from './msw-handlers'

export const server = setupServer(...handlers)
```

## MSW handlers — happy-path defaults that each test can override

Since `apps/web` consumes both backend OpenAPI specs through one `@viacerta/api-client`, there is now **one combined set of MSW handlers** covering the merged API surface (student/parent endpoints under `/api/v1/portal/*` and advisor/internal endpoints under `/api/v1/advisor/*`). Split into per-domain files for readability and combine them into a single array:

```ts
// apps/web/src/test/msw-handlers/index.ts
import { authHandlers } from './auth'
import { studentHandlers } from './student'
import { advisorHandlers } from './advisor'
import { internalHandlers } from './internal'

export const handlers = [
  ...authHandlers,
  ...studentHandlers,
  ...advisorHandlers,
  ...internalHandlers,
]
```

```ts
// apps/web/src/test/msw-handlers/auth.ts
import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

export const authHandlers = [
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
]
```

```ts
// apps/web/src/test/msw-handlers/student.ts
import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

export const studentHandlers = [
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

  // ... handlers for documents, report, decision, etc.
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

```ts
// apps/web/src/test/msw-handlers/advisor.ts
import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

export const advisorHandlers = [
  http.get(`${API}/advisor/cases`, () =>
    HttpResponse.json({ items: [], total: 0 }),
  ),

  // ... handlers for student detail, assessment, GCRI, report builder, etc.
]
```

```ts
// apps/web/src/test/msw-handlers/internal.ts
import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

export const internalHandlers = [
  http.get(`${API}/advisor/leads`, () =>
    HttpResponse.json({ items: [], total: 0 }),
  ),

  // ... handlers for document-verify, data-ops, outcomes, users, etc.
]
```

This is a starting organization, not a hard rule — group handler files however reads best as the suite grows, as long as they all live under `apps/web/src/test/msw-handlers/` and are combined into the single `handlers` array consumed by `msw-server.ts`.

## Custom render wrapper — `apps/web/src/test/render.tsx`

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

## Critical test 1 — Role-gating (`<RoleGate>` / `<ProtectedRoute>`)

Since [ADR-007](./ADR-007-single-app-merge.md), audience separation is a **runtime routing** property, not a bundle-content property — `apps/web` ships one bundle containing both student-facing and advisor-facing code, types, and route definitions. The equivalent of the old "audience separation" test suite is now **exhaustive role-gating coverage**: every advisor/internal route in `apps/web/src/router.tsx` must have a test asserting that a STUDENT (or PARENT, or unauthenticated) user hitting it is redirected to `/forbidden` (or `/login`), and that an authorized role can render it.

```tsx
// apps/web/src/__tests__/role-gating.test.tsx
import { http, HttpResponse } from 'msw'
import { server } from '@/test/msw-server'
import { render, screen, waitFor } from '@/test/render'
import { router } from '@/router'
import { RouterProvider } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'

function loginAs(role: string) {
  useAuthStore.setState({
    user: { id: 'u1', email: 'a@b.com', fullName: 'Test User', role, studentId: role === 'STUDENT' ? 's1' : null },
    accessToken: 'access',
  })
}

describe('RoleGate: advisor/internal routes reject unauthorized roles', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null })
  })

  it('redirects a STUDENT hitting an advisor route to /forbidden', async () => {
    loginAs('STUDENT')

    render(<RouterProvider router={router} />, { initialEntries: ['/students/s1/assessment'] })

    await waitFor(() => expect(screen.getByText(/forbidden|not authorized/i)).toBeInTheDocument())
  })

  it('redirects an unauthenticated user to /login', async () => {
    render(<RouterProvider router={router} />, { initialEntries: ['/cases'] })

    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })

  it('allows an ADVISOR to render the assessment route', async () => {
    loginAs('ADVISOR')
    server.use(
      http.get('*/advisor/students/:id/assessment', () =>
        HttpResponse.json({ studentId: 's1', dimensions: [], flag: 'YELLOW' }),
      ),
    )

    render(<RouterProvider router={router} />, { initialEntries: ['/students/s1/assessment'] })

    await waitFor(() => expect(screen.queryByText(/forbidden/i)).toBeNull())
  })
})
```

Run this pattern for every entry under `routes/advisor/*` and `routes/internal/*` in `apps/web/src/router.tsx`, against the `<RoleGate allow={...}>` group it's actually wrapped in (`ADVISOR_ROLES`, `ADMIN_ONLY`, etc. from `apps/web/src/lib/roles.ts`). Also cover `<ProtectedRoute>`: every route except `/login` and `/register` should redirect an unauthenticated user to `/login`.

The backend remains the actual security boundary — a STUDENT's JWT is rejected by `/api/v1/advisor/*` regardless of the frontend. These tests guard the **frontend** experience (no dead-end UI flashes, correct redirects), not the data boundary itself.

There is no longer a build-level or bundle-content check (no `scripts/check-portal-bundle.sh`, no `no-restricted-imports` blocking `@viacerta/api-client/advisor` — that subpath doesn't exist). `@viacerta/api-client` exports one merged set of types; `StudentReportResponse` and `AdvisorAssessmentResponse` can both be imported from any feature. See [ADR-007](./ADR-007-single-app-merge.md) for the tradeoff this accepts.

## Critical test 2 — Form validation (Override dialog)

```tsx
// apps/web/src/features/assessment/__tests__/OverrideDialog.test.tsx
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
// apps/web/src/features/intake/__tests__/IntakeForm.test.tsx
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
import { apiClient } from '../index'

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

    const [r1, r2, r3] = await Promise.all([
      apiClient.GET('/api/v1/portal/students/me/journey'),
      apiClient.GET('/api/v1/portal/students/me/journey'),
      apiClient.GET('/api/v1/portal/students/me/journey'),
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

    await expect(apiClient.GET('/api/v1/portal/students/me/journey')).rejects.toMatchObject({
      title: expect.stringMatching(/sign in/i),
    })
    expect(events).toHaveLength(1)
    expect(localStorage.getItem('viacerta:access')).toBeNull()
  })
})
```

This single `apiClient` and single `authStorage` namespace (`viacerta:access` / `viacerta:refresh`) replace the old per-app `createPortalClient`/`createAdvisorClient` factories and `vc.portal.*`/`vc.advisor.*` storage keys — there is one refresh interceptor, one `viacerta:session-expired` event, regardless of which audience's endpoint triggered the 401.

## Playwright — Aditya happy-path e2e

`apps/web-e2e/e2e/aditya-yellow.spec.ts`. Run against a staging backend with seeded data; or a containerised backend pinned to a fixture.

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

    // 7. Student-facing report never shows advisor-only fields
    const text = await page.textContent('main')
    expect(text).not.toMatch(/override delta/i)
    expect(text).not.toMatch(/rubric version/i)
    expect(text).not.toMatch(/L[2-5]/)   // evidence levels not shown to students
  })
})
```

This last assertion is now a **content/UI** check, not a bundle-isolation guarantee — the same `apps/web` bundle that renders this page also contains advisor-facing components and types (see [ADR-007](./ADR-007-single-app-merge.md)). The check still matters: it verifies the student-facing report component doesn't *render* advisor-only fields even if the backend response happens to include them, same as Critical test 1's RTL equivalent for the report page.

## Playwright config

One Playwright project (`@viacerta/web-e2e`), one app under test, one base URL. Student/parent and advisor/internal flows both run against `http://localhost:5173` (or the staging URL); Playwright "projects" are used here to vary the **logged-in role** (via storage state) rather than to target different apps:

```ts
// apps/web-e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173' },
  projects: [
    { name: 'student', use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/student.json' } },
    { name: 'advisor', use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/advisor.json' } },
  ],
  webServer: process.env.CI ? undefined : {
    command: 'pnpm --filter @viacerta/web dev',
    port: 5173,
    reuseExistingServer: true,
  },
})
```

`e2e/.auth/*.json` storage states are produced by a Playwright global-setup step that logs in as a seeded STUDENT and a seeded ADVISOR against the test backend. Specs that don't need a logged-in user (registration, login) override `storageState` per-test or run unauthenticated.

## CI workflow — `.github/workflows/ci.yml`

One test job for `@viacerta/web` (plus the always-separate `packages/*` test jobs, which run as part of the same `pnpm -r` commands):

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

      - run: pnpm --filter @viacerta/web build

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./apps/web/coverage/lcov.info,./packages/*/coverage/lcov.info

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
      - run: pnpm --filter @viacerta/web-e2e exec playwright test
        env:
          PLAYWRIGHT_BASE_URL: ${{ secrets.STAGING_WEB_URL }}
```

`pnpm -r run test` and `pnpm -r run typecheck`/`lint` already cover `apps/web` and every `packages/*` workspace in one pass — there is no separate per-app test job to maintain anymore.

## What we don't test

- Recharts internals (component rendering only — that we pass the right data + colors).
- React Query internals (we test our hooks' contracts: invalidation keys, error handling).
- The generated `@viacerta/api-client` types in `src/generated/api.d.ts` (they come from the backend's two merged `openapi.json` specs; a backend contract test owns this).
- Visual snapshots — too fragile; we test text + roles, not pixels.

## Test data fixtures

```ts
// apps/web/src/test/fixtures/aditya.ts
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

Re-used across Vitest (`apps/web/src/test/fixtures/aditya.ts`) and Playwright (`apps/web-e2e` imports the same file, or a copy kept in sync — see `@viacerta/web-e2e`'s `package.json` for how it references `apps/web`'s source). Single source of truth for what "Aditya" looks like in the frontend test suite — same fact set the backend's `tests/test_gcss_formula.py::test_aditya_basu_yellow_76` uses.
