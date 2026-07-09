# 09 — Parent View

> Parents see a deliberately slim, jargon-light surface. No advisor fields, no rubric versions, no override deltas. Just: where the student is, what the score means, what's next.

## Mounting

The parent surface lives **inside the single `apps/web` app** under
`/parent/*` (route components in `apps/web/src/routes/parent/`, feature code
in `apps/web/src/features/parent/` — see
[ADR-007](./ADR-007-single-app-merge.md) and `docs/01-project-structure.md`):

1. Parents and students share the same login system, the same backend portal
   API, the same auth store, and the same audience disclaimer footer.
2. There's no separate parent or "portal" bundle/deploy — `apps/web` is the
   one app, one build, one deploy that serves the student/parent surface
   alongside the advisor/internal surface (role-gated at runtime).

Audience separation for the parent view is enforced **at the API +
response-shape level**: advisor-only fields never appear in the parent
endpoints' response payload, so the parent screens simply have nothing to
render — the types for those fields don't even exist on the parent response
shape. This mirrors the framing in `docs/00-context.md`'s "Trust posture"
section: the frontend doesn't need to hide anything because the backend never
sends it, and a PARENT JWT couldn't fetch advisor-only data even if the UI
asked for it. Parent routes are behind `<ProtectedRoute>` (must be logged in
as PARENT) but are not `<RoleGate>`-gated the way advisor/internal routes
are — `<RoleGate>` exists to keep STUDENT/PARENT users out of advisor
screens, which isn't a concern here. The shared app imports everything from
`@viacerta/api-client` — same import path as the student surface — and the
parent endpoints simply return a parent-shaped response.

## Routes

```
/parent                          /parent/landing — list linked students
/parent/students/:studentId      ParentStudentPage — slim summary
/parent/students/:studentId/link MyParentLinkRequestPage (if pending approval)
```

Post-login routing (see `docs/05-auth-and-routing.md`):

```ts
if (user.role === 'PARENT') {
  const linkedStudents = await api.parent.listLinkedStudents()
  if (linkedStudents.length === 1) {
    navigate(`/parent/students/${linkedStudents[0].id}`, { replace: true })
  } else {
    navigate('/parent', { replace: true })
  }
}
```

## Schema (consumed)

```ts
// from @viacerta/api-client generated types — parent-flavoured response
export type ParentStudentSummary = {
  studentId: string
  studentName: string
  currentStage: string            // user-facing label, not state code
  currentStageBlurb: string       // one sentence describing the stage
  gcssFlag: 'GREEN' | 'YELLOW' | 'RED' | 'DECLINED' | null
  gcssScore: number | null        // shown only when assessment is confirmed
  parentSummary: string | null    // human-written summary block; null until report is published
  nextStep: { label: string; detail: string } | null
  disclaimer: string              // always the same audience-disclaimer text
}
```

**Notably absent**: `dimensionScores`, `subScores`, `overrideDelta`, `evidenceLevel`, `rubricVersionId`, `confidenceMultiplier`, `riskRegister`, `roiAnalysis`, `ninetyDayPlan`. None of these reach the parent payload from the backend.

## Screen — ParentStudentPage

```tsx
// apps/web/src/routes/parent/ParentSummaryPage.tsx
import { useParams } from 'react-router-dom'
import { Card, CardBody, AsyncBoundary } from '@viacerta/ui'
import { GcssFlagBadge, ReportDisclaimer } from '@viacerta/ui/viacerta'
import { useParentStudent } from '@/hooks/use-parent-student'

export function ParentStudentPage() {
  return (
    <AsyncBoundary>
      <Inner />
    </AsyncBoundary>
  )
}

function Inner() {
  const { studentId } = useParams<{ studentId: string }>()
  const { data: summary } = useParentStudent(studentId!)
  if (!summary) return null

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-gray-500">Student summary</p>
        <h1 className="text-2xl font-semibold">{summary.studentName}</h1>
      </header>

      <Card>
        <CardBody className="space-y-2">
          <div className="text-sm font-medium uppercase tracking-wide text-navy-600">
            Current stage
          </div>
          <h2 className="text-lg font-semibold">{summary.currentStage}</h2>
          <p className="text-sm text-gray-700">{summary.currentStageBlurb}</p>
        </CardBody>
      </Card>

      {summary.gcssScore !== null && summary.gcssFlag && (
        <Card>
          <CardBody className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Sustainability score</div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-3xl font-semibold">{summary.gcssScore}</span>
                <GcssFlagBadge flag={summary.gcssFlag} size="md" />
              </div>
              <p className="mt-2 max-w-md text-sm text-gray-600">
                {flagBlurbForParents(summary.gcssFlag)}
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {summary.parentSummary && (
        <Card>
          <CardBody>
            <h3 className="font-medium">Summary for parents</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {summary.parentSummary}
            </p>
          </CardBody>
        </Card>
      )}

      {summary.nextStep && (
        <Card>
          <CardBody>
            <div className="text-sm font-medium uppercase tracking-wide text-navy-600">
              Next step
            </div>
            <h3 className="mt-1 font-semibold">{summary.nextStep.label}</h3>
            <p className="mt-1 text-sm text-gray-700">{summary.nextStep.detail}</p>
          </CardBody>
        </Card>
      )}

      <ReportDisclaimer />
    </div>
  )
}

function flagBlurbForParents(flag: string): string {
  switch (flag) {
    case 'GREEN':
      return 'Your child is well-prepared to pursue study abroad. We will proceed with country selection and applications.'
    case 'YELLOW':
      return 'Your child is broadly ready, but we have identified specific areas to strengthen before applications. The plan below addresses these.'
    case 'RED':
      return 'Significant preparation is needed before applying. We recommend a structured plan over the next 6–12 months rather than rushing applications.'
    case 'DECLINED':
      return 'Based on the assessment, we have recommended foundational preparation before pursuing study abroad. Your advisor will walk you through alternative paths.'
    default:
      return ''
  }
}
```

## What the parent intentionally does *not* see

| Field | Why hidden |
|---|---|
| Sub-component scores and anchors | Reveals scoring rubric; risks misinterpretation; advisor's job to contextualise |
| Override delta + evidence note | Internal advisor record; parents see the final score only |
| Evidence levels per document | Confusing; what matters is that the score is confirmed or pending |
| Confidence multiplier | Same; final score already reflects it |
| Risk register | Advanced, decision-tool detail; advisor reviews verbally in Session 2 |
| ROI chart | Same |
| 90-day plan | Same |
| GCRI per-country breakdown | Discussed live in Session 2 |
| Rubric version | Implementation detail |

If parents want details, the advisor walks them through during Session 2. This is intentional — putting the full report in front of parents without context risks misuse.

## Parent linking flow

```
1. Parent registers at /register with role=PARENT
2. Parent lands on /parent (empty state if no linked student yet)
3. Parent clicks "Link to a student" → enters student's email
4. Backend creates parent_links row with approved_by_student=false; sends email/in-app notice to student
5. Student receives a banner in JourneyDashboard: "<parent name> wants to follow your journey — Approve / Decline"
6. On approve, parent_links.approved_by_student=true; parent sees the student in their list
```

Frontend bits:

```tsx
// apps/web/src/routes/parent/ParentLandingPage.tsx
import { Card, CardBody, Button, Input } from '@viacerta/ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLinkedStudents, useRequestLink } from '@/hooks/use-parent-linking'

const LinkSchema = z.object({
  studentEmail: z.string().email(),
})

export function ParentLandingPage() {
  const { data: students } = useLinkedStudents()
  const link = useRequestLink()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<{ studentEmail: string }>({ resolver: zodResolver(LinkSchema) })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Welcome</h1>
        <p className="mt-1 text-sm text-gray-600">
          Follow your child's ViaCerta journey. They will need to approve your link.
        </p>
      </header>

      {students && students.length > 0 ? (
        <ul className="space-y-3">
          {students.map((s) => (
            <li key={s.studentId}>
              <Card>
                <CardBody className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.studentName}</p>
                    <p className="text-sm text-gray-600">{s.currentStage}</p>
                  </div>
                  <a href={`/parent/students/${s.studentId}`}>
                    <Button variant="outline">View</Button>
                  </a>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-600">No linked students yet.</p>
      )}

      <Card>
        <CardBody>
          <h2 className="font-medium">Link to a student</h2>
          <p className="mt-1 text-sm text-gray-600">
            Enter your child's ViaCerta-registered email. They will need to approve.
          </p>
          <form
            onSubmit={handleSubmit(async (v) => {
              await link.mutateAsync(v)
              reset()
            })}
            className="mt-3 flex items-start gap-2"
          >
            <div className="flex-1">
              <Input
                type="email"
                placeholder="student@example.com"
                {...register('studentEmail')}
                error={errors.studentEmail?.message}
              />
            </div>
            <Button type="submit" loading={isSubmitting}>
              Request link
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
```

## Hooks

- `useLinkedStudents()` — GET `/portal/parent/students`
- `useParentStudent(id)` — GET `/portal/parent/students/{id}`, polls 30s
- `useRequestLink()` — POST `/portal/parent/link-request`, invalidates `['parent-linked-students']`

## Audience-leak test (lives in tests, but referenced here)

```ts
// apps/web/src/__tests__/audience-separation.test.tsx
describe('parent view', () => {
  it('never displays advisor-only fields', async () => {
    server.use(
      http.get('/api/v1/portal/parent/students/:id', () =>
        HttpResponse.json({
          studentId: 's1', studentName: 'Aditya Basu',
          currentStage: 'Score confirmed', currentStageBlurb: '...',
          gcssFlag: 'YELLOW', gcssScore: 76,
          parentSummary: 'Aditya is broadly ready...',
          nextStep: { label: 'Close gaps', detail: '...' },
          disclaimer: '...',
        })
      ),
    )

    render(<ParentStudentPage />, { initialEntries: ['/parent/students/s1'] })

    await waitFor(() => screen.getByText(/Aditya Basu/))

    // Forbidden strings — confirms parent shape doesn't expose internals
    expect(screen.queryByText(/override/i)).toBeNull()
    expect(screen.queryByText(/rubric/i)).toBeNull()
    expect(screen.queryByText(/evidence level/i)).toBeNull()
    expect(screen.queryByText(/confidence multiplier/i)).toBeNull()
    expect(screen.queryByText(/L\d/)).toBeNull()         // L1..L5 evidence levels
  })
})
```
