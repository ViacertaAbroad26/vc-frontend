# 08 — Student Portal Screens

> These are the student/parent surface's screens within the single
> `apps/web` app (see [ADR-007](./ADR-007-single-app-merge.md)). Routes live
> under `apps/web/src/routes/student/`, feature code under
> `apps/web/src/features/{intake,documents,pending,report,decision,journey}/`.
> "Portal" below is used as a logical label for this surface, not a separate
> deployment — there is one Vite dev server (port 5173), one build, one
> deploy.

> Every screen for the STUDENT role. Each section: route, components, hooks consumed, full TSX where the screen is non-trivial.

## Screen map

```
/login                          public — LoginPage
/register                       public — RegisterPage
/                               authed — JourneyDashboard (default landing)
/intake                         intake start — PersonaPicker → start submission
/intake/:submissionId           intake form — IntakeForm
/documents                      document tray — DocumentsPage
/pending                        AI processing wait — PendingAssessmentPage
/report                         published report — ReportPage
/decision                       decision gate after Session 2 — DecisionPage
*                               NotFoundPage
```

Post-login redirect (see `docs/05`) sends STUDENT to `/` if intake complete, else `/intake`.

## Layout shell — `apps/web/src/components/layout/PortalShell.tsx`

This is a student/parent-flavored layout used alongside the shared
`AppShell`/`SideNav`/`TopBar` primitives in
`apps/web/src/components/layout/` (see `docs/01-project-structure.md`). It
renders inside a route subtree wrapped in `<ProtectedRoute>`.

```tsx
import { Outlet, NavLink } from 'react-router-dom'
import { GraduationCap, FileText, Upload, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useJourney } from '@/hooks/use-journey'
import { ReportDisclaimer } from '@viacerta/ui/viacerta'

export function PortalShell() {
  const { user, logout } = useAuthStore()
  const { data: journey } = useJourney()
  const stage = journey?.currentStateCode

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-navy-600" />
            <span className="font-semibold">ViaCerta</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <NavLink to="/" end className={navClass}>Journey</NavLink>
            <NavLink to="/documents" className={navClass}>Documents</NavLink>
            {stage === 'REPORT_BUILT' || stage === 'SESSION2_DONE' ? (
              <NavLink to="/report" className={navClass}>Report</NavLink>
            ) : null}
            <button onClick={logout} className="text-gray-500 hover:text-gray-900">
              <LogOut className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <ReportDisclaimer compact />
        </div>
      </footer>
    </div>
  )
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'text-navy-700 font-medium' : 'text-gray-600 hover:text-gray-900'
```

## Screen 1 — RegisterPage

`apps/web/src/routes/auth/RegisterPage.tsx` (full implementation, since it shows the canonical form pattern):

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { RegisterSchema, type RegisterValues } from '@/features/auth/schemas'
import { useRegister } from '@/hooks/use-register'
import { Button, Input, Card, CardHeader, CardBody } from '@viacerta/ui'
import { useAuthStore } from '@/stores/auth-store'

export function RegisterPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const register = useRegister()

  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { role: 'STUDENT', consentToTerms: false },
  })

  const onSubmit = async (values: RegisterValues) => {
    try {
      const res = await register.mutateAsync(values)
      setSession(res.user, res.tokens)
      navigate('/', { replace: true })
    } catch (e: any) {
      if (e.title === 'Email taken') {
        setError('email', { message: 'This email is already registered' })
      } else if (e.extras?.fields) {
        for (const [name, msg] of Object.entries<string>(e.extras.fields)) {
          setError(name as keyof RegisterValues, { message: msg })
        }
      } else {
        setError('root', { message: e.detail ?? 'Something went wrong' })
      }
    }
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Create your ViaCerta account</h1>
          <p className="mt-1 text-sm text-gray-600">
            Start your study-abroad readiness assessment.
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Full name"
              autoComplete="name"
              {...field('fullName')}
              error={errors.fullName?.message}
            />
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              {...field('email')}
              error={errors.email?.message}
            />
            <Input
              label="Phone (optional)"
              type="tel"
              autoComplete="tel"
              placeholder="+91 9876543210"
              {...field('phone')}
              error={errors.phone?.message}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              {...field('password')}
              error={errors.password?.message}
              hint="8+ chars, one upper, one digit, one symbol"
            />
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              {...field('confirmPassword')}
              error={errors.confirmPassword?.message}
            />

            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input type="checkbox" {...field('consentToTerms')} className="mt-1" />
              <span>
                I agree to ViaCerta's{' '}
                <Link to="/terms" className="text-navy-700 underline">Terms</Link>
                {' and '}
                <Link to="/privacy" className="text-navy-700 underline">Privacy Notice</Link>.
              </span>
            </label>
            {errors.consentToTerms && (
              <p className="text-sm text-red-600">{errors.consentToTerms.message}</p>
            )}

            {errors.root && (
              <p className="text-sm text-red-600">{errors.root.message}</p>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full">
              Create account
            </Button>
          </form>
        </CardBody>
      </Card>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-navy-700 underline">Sign in</Link>
      </p>
    </div>
  )
}
```

## Screen 2 — JourneyDashboard (route `/`)

The single most-used screen. Shows where the student is in the journey, what's pending, what's next. Polls journey every 10s while in pending states.

```tsx
// apps/web/src/routes/student/DashboardPage.tsx
import { Link } from 'react-router-dom'
import { useJourney } from '@/hooks/use-journey'
import { JourneyTimeline } from '@/features/journey/JourneyTimeline'
import { NextActionCard } from '@/features/journey/NextActionCard'
import { Card, CardBody, AsyncBoundary } from '@viacerta/ui'
import { GcssFlagBadge, ScoreGauge } from '@viacerta/ui/viacerta'

export function JourneyDashboard() {
  return (
    <AsyncBoundary>
      <JourneyContent />
    </AsyncBoundary>
  )
}

function JourneyContent() {
  const { data: journey } = useJourney()
  if (!journey) return null

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Your journey</h1>
        <p className="mt-1 text-sm text-gray-600">
          We assess readiness, run risk, and build a plan you can act on.
        </p>
      </header>

      <NextActionCard journey={journey} />

      {journey.gcss && (
        <Card>
          <CardBody className="flex items-center justify-between gap-6">
            <div>
              <div className="text-sm text-gray-500">Sustainability score</div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-3xl font-semibold">{journey.gcss.final}</span>
                <GcssFlagBadge flag={journey.gcss.flag} size="md" />
              </div>
              <p className="mt-2 max-w-md text-sm text-gray-600">
                {flagBlurb(journey.gcss.flag)}
              </p>
            </div>
            <ScoreGauge value={journey.gcss.final} size={140} />
          </CardBody>
        </Card>
      )}

      <JourneyTimeline current={journey.currentStateCode} history={journey.history} />

      {journey.currentStateCode === 'REPORT_BUILT' && (
        <Link to="/report" className="block">
          <Card className="border-amber-300 bg-amber-50 hover:bg-amber-100">
            <CardBody>
              <p className="font-medium text-amber-900">Your report is ready</p>
              <p className="mt-1 text-sm text-amber-800">
                Click to view your full GCSS + GCRI assessment.
              </p>
            </CardBody>
          </Card>
        </Link>
      )}
    </div>
  )
}

function flagBlurb(flag: string) {
  switch (flag) {
    case 'GREEN':
      return 'You are well-prepared. We will proceed to country mapping and applications.'
    case 'YELLOW':
      return 'You are ready with a plan. We have identified specific gaps to close before applications.'
    case 'RED':
      return 'Significant preparation needed before applications. See the report for a structured 6-12 month plan.'
    case 'DECLINED':
      return 'Based on the current assessment, we recommend foundational prep before pursuing study abroad.'
    default:
      return ''
  }
}
```

### NextActionCard

```tsx
// apps/web/src/features/journey/NextActionCard.tsx
import { Link } from 'react-router-dom'
import { Card, CardBody, Button } from '@viacerta/ui'
import type { Journey } from '@viacerta/api-client'

export function NextActionCard({ journey }: { journey: Journey }) {
  const action = nextAction(journey.currentStateCode)
  if (!action) return null

  return (
    <Card>
      <CardBody className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium uppercase tracking-wide text-navy-600">
            {action.label}
          </div>
          <h2 className="mt-1 text-lg font-semibold">{action.title}</h2>
          <p className="mt-1 text-sm text-gray-600">{action.detail}</p>
        </div>
        {action.cta && (
          <Link to={action.cta.to}>
            <Button>{action.cta.label}</Button>
          </Link>
        )}
      </CardBody>
    </Card>
  )
}

function nextAction(state: string) {
  switch (state) {
    case 'LEAD':
    case 'INTAKE_SENT':
      return {
        label: 'Next step',
        title: 'Complete your intake form',
        detail: 'Tell us about your goals, academics, finances and background. Takes ~30 minutes; you can save and resume.',
        cta: { to: '/intake', label: 'Start intake' },
      }
    case 'INTAKE_COMPLETE':
    case 'AI_PRESCORED':
      return {
        label: 'Up next',
        title: 'Book your Session 1',
        detail: "We'll review your intake with an advisor and confirm your sustainability score.",
        cta: { to: '/pending', label: 'View status' },
      }
    case 'SESSION1_BOOKED':
      return {
        label: 'Scheduled',
        title: 'Session 1 with your advisor',
        detail: 'Your advisor will walk you through your pre-scored assessment and refine it.',
        cta: null,
      }
    case 'GCSS_CONFIRMED':
    case 'GAP_LOOP':
      return {
        label: 'In progress',
        title: 'Close identified gaps',
        detail: 'Your advisor will share specific actions to strengthen your readiness before country mapping.',
        cta: null,
      }
    case 'GCRI_RUN':
      return {
        label: 'In progress',
        title: 'Running country-risk analysis',
        detail: 'We are scoring your target countries against the live risk matrix.',
        cta: null,
      }
    case 'REPORT_BUILT':
      return {
        label: 'Ready',
        title: 'Your report is published',
        detail: 'Review the full GCSS + GCRI report before Session 2.',
        cta: { to: '/report', label: 'View report' },
      }
    case 'SESSION2_DONE':
      return {
        label: 'Decision',
        title: 'Choose how to proceed',
        detail: 'You can enrol for full-service support, prepare on your own, or step back.',
        cta: { to: '/decision', label: 'Make decision' },
      }
    default:
      return null
  }
}
```

## Screen 3 — Intake start (`/intake`)

Persona picker, then `POST /intake/start`, then redirect to `/intake/:submissionId`.

```tsx
// apps/web/src/routes/student/IntakeStartPage.tsx
import { useNavigate } from 'react-router-dom'
import { Card, CardBody, Button } from '@viacerta/ui'
import { useStartIntake } from '@/hooks/use-start-intake'

const PERSONAS = [
  { key: 'SCHOOL_STUDENT',         label: 'School student',     blurb: 'Class 11 or 12, exploring undergraduate options.' },
  { key: 'FINAL_YEAR_UG',          label: 'Final-year UG',      blurb: "In your last year of college and applying for Masters." },
  { key: 'WORKING_PROFESSIONAL',   label: 'Working professional', blurb: '1+ years of work experience, planning Masters or MBA.' },
] as const

export function IntakeStartPage() {
  const navigate = useNavigate()
  const start = useStartIntake()

  const pick = async (persona: typeof PERSONAS[number]['key']) => {
    const res = await start.mutateAsync({ persona })
    navigate(`/intake/${res.submissionId}`)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Start your intake</h1>
        <p className="mt-1 text-sm text-gray-600">
          Pick the option that fits where you are right now.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {PERSONAS.map((p) => (
          <Card key={p.key}>
            <CardBody>
              <h3 className="font-medium">{p.label}</h3>
              <p className="mt-1 text-sm text-gray-600">{p.blurb}</p>
              <Button
                onClick={() => pick(p.key)}
                variant="outline"
                className="mt-4 w-full"
                loading={start.isPending}
              >
                Choose
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

## Screen 4 — Intake form (`/intake/:submissionId`)

Already covered in detail in `docs/07-forms-and-validation.md`. The page wires:

```tsx
// apps/web/src/routes/student/IntakeFormPage.tsx
import { useParams } from 'react-router-dom'
import { useIntakeSubmission, useIntakeForm } from '@/hooks/use-intake'
import { IntakeForm } from '@/features/intake/IntakeForm'
import { AsyncBoundary } from '@viacerta/ui'

export function IntakeFormPage() {
  const { submissionId } = useParams<{ submissionId: string }>()
  return (
    <AsyncBoundary>
      <Inner submissionId={submissionId!} />
    </AsyncBoundary>
  )
}

function Inner({ submissionId }: { submissionId: string }) {
  const { data: submission } = useIntakeSubmission(submissionId)
  const { data: form } = useIntakeForm(submission?.persona)
  if (!submission || !form) return null

  return <IntakeForm submission={submission} form={form} />
}
```

## Screen 5 — DocumentsPage (`/documents`)

Tile per required document. Each tile shows the current evidence_level badge, upload button, verification status.

```tsx
// apps/web/src/routes/student/DocumentsPage.tsx
import { Card, CardBody, Button, AsyncBoundary } from '@viacerta/ui'
import { EvidenceLevelBadge } from '@viacerta/ui/viacerta'
import { useDocuments, useDocumentRequirements, useUploadDocument } from '@/hooks/use-documents'
import { useState } from 'react'

export function DocumentsPage() {
  return (
    <AsyncBoundary>
      <Inner />
    </AsyncBoundary>
  )
}

function Inner() {
  const { data: requirements } = useDocumentRequirements()
  const { data: documents } = useDocuments()
  if (!requirements || !documents) return null

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Documents</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload supporting documents to verify your assessment. Higher verification raises your confidence multiplier.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {requirements.required.map((req) => {
          const doc = documents.find((d) => d.kind === req.kind && d.isLatest)
          return <DocumentTile key={req.kind} requirement={req} document={doc} />
        })}
      </div>

      {requirements.optional.length > 0 && (
        <>
          <h2 className="mt-8 text-sm font-medium uppercase tracking-wide text-gray-500">
            Optional but improves your score
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {requirements.optional.map((req) => {
              const doc = documents.find((d) => d.kind === req.kind && d.isLatest)
              return <DocumentTile key={req.kind} requirement={req} document={doc} />
            })}
          </div>
        </>
      )}
    </div>
  )
}

function DocumentTile({ requirement, document }: { requirement: any; document?: any }) {
  const upload = useUploadDocument()
  const [busy, setBusy] = useState(false)

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      await upload.mutateAsync({ kind: requirement.kind, file })
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-medium">{requirement.label}</h3>
            <p className="mt-1 text-sm text-gray-600">{requirement.blurb}</p>
          </div>
          {document && <EvidenceLevelBadge level={document.evidenceLevel} />}
        </div>

        {document ? (
          <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
            <span className="text-gray-600">
              {document.originalFilename} · {humanFileSize(document.sizeBytes)}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={document.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="text-navy-700 underline"
              >
                View
              </a>
              <label className="cursor-pointer text-gray-600 hover:text-gray-900">
                Replace
                <input type="file" className="sr-only" onChange={onFile} disabled={busy} />
              </label>
            </div>
          </div>
        ) : (
          <label className="mt-4 block">
            <span className="sr-only">Upload {requirement.label}</span>
            <input
              type="file"
              onChange={onFile}
              disabled={busy}
              className="block w-full text-sm text-gray-600
                file:mr-4 file:rounded-md file:border-0
                file:bg-navy-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white
                hover:file:bg-navy-700 disabled:opacity-60"
            />
          </label>
        )}
      </CardBody>
    </Card>
  )
}

function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
```

## Screen 6 — PendingAssessmentPage (`/pending`)

Shown between AI pre-score in flight and report build complete. Polls every 10s.

```tsx
// apps/web/src/routes/student/PendingPage.tsx
import { Card, CardBody } from '@viacerta/ui'
import { Loader2 } from 'lucide-react'
import { useJourney } from '@/hooks/use-journey'

const STAGE_LABELS: Record<string, string> = {
  INTAKE_COMPLETE:    'AI is pre-scoring your assessment',
  AI_PRESCORED:       'Waiting for advisor to review',
  SESSION1_BOOKED:    'Session 1 booked with your advisor',
  GCSS_CONFIRMED:     'Score confirmed; preparing country-risk analysis',
  GAP_LOOP:           'Working on gap closure with your advisor',
  GCRI_RUN:           'Running country-risk analysis',
  REPORT_BUILT:       'Report ready',
}

export function PendingAssessmentPage() {
  const { data: journey } = useJourney()
  if (!journey) return null

  const label = STAGE_LABELS[journey.currentStateCode] ?? 'In progress'

  return (
    <Card>
      <CardBody className="flex flex-col items-center gap-4 py-12 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-navy-600" />
        <div>
          <h2 className="text-xl font-medium">{label}</h2>
          <p className="mt-1 text-sm text-gray-600">
            We will email you when there is an update. You can leave this page.
          </p>
        </div>
      </CardBody>
    </Card>
  )
}
```

## Screen 7 — ReportPage (`/report`)

The published report viewer. Six sections, audience-filtered (no advisor-only fields), with PDF download.

```tsx
// apps/web/src/routes/student/ReportPage.tsx
import { useStudentReport } from '@/hooks/use-student-report'
import { Card, CardBody, Button, AsyncBoundary } from '@viacerta/ui'
import { ReportDisclaimer, GcssFlagBadge, ScoreGauge, DimensionBar, RiskBandPill } from '@viacerta/ui/viacerta'
import { GcriBreakdown } from '@/features/report/GcriBreakdown'
import { RoiChart } from '@/features/report/RoiChart'
import { Download } from 'lucide-react'

export function ReportPage() {
  return (
    <AsyncBoundary>
      <Inner />
    </AsyncBoundary>
  )
}

function Inner() {
  const { data: report } = useStudentReport()
  if (!report) return null

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Your report</h1>
          <p className="mt-1 text-sm text-gray-600">
            Published {new Date(report.publishedAt!).toLocaleDateString()}
          </p>
        </div>
        {report.pdfDownloadUrl && (
          <a href={report.pdfDownloadUrl} download>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </a>
        )}
      </header>

      <ReportDisclaimer />

      <Section title="Summary">
        <Card>
          <CardBody className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
            <ScoreGauge value={report.gcss.final} size={160} />
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-semibold">{report.gcss.final}</span>
                <GcssFlagBadge flag={report.gcss.flag} size="md" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                {report.executiveSummary}
              </p>
            </div>
          </CardBody>
        </Card>
      </Section>

      <Section title="Sustainability score breakdown">
        <div className="space-y-3">
          {report.gcss.dimensions.map((d) => (
            <DimensionBar
              key={d.key}
              label={d.label}
              score={d.raw}
              max={d.max}
              summary={d.advisorInsight}
            />
          ))}
        </div>
      </Section>

      <Section title="Country-risk analysis">
        {/* Phase 3 #1: each country card includes an OutcomePredictionBand showing
            outcomeProbabilityLow-outcomeProbabilityHigh as a range (e.g. "54-70%").
            No confidence level/rationale/model version here — advisor-only fields.
            See docs/12-visualization.md "Outcome prediction band". */}
        <GcriBreakdown results={report.gcri} />
      </Section>

      <Section title="ROI analysis">
        <RoiChart data={report.roi} />
      </Section>

      <Section title="Risk register">
        <div className="space-y-2">
          {report.riskRegister.map((r, i) => (
            <Card key={i}>
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-medium">{r.risk}</h4>
                  <RiskBandPill band={r.severity} />
                </div>
                <p className="mt-1 text-sm text-gray-700">{r.mitigation}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Your 90-day plan">
        <div className="space-y-3">
          {report.ninetyDayPlan.map((week) => (
            <Card key={week.week}>
              <CardBody>
                <div className="text-xs font-medium uppercase tracking-wide text-navy-600">
                  Week {week.week}
                </div>
                <h4 className="mt-1 font-medium">{week.focus}</h4>
                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                  {week.actions.map((a, i) => (
                    <li key={i}>· {a}</li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  )
}
```

## Screen 8 — DecisionPage (`/decision`)

Three-choice gate after Session 2.

```tsx
// apps/web/src/routes/student/DecisionGatePage.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Card, CardBody, Button } from '@viacerta/ui'
import { useRecordDecision } from '@/hooks/use-decision'

const DecisionSchema = z.object({
  outcome: z.enum(['ENROL_FULL_SERVICE', 'SELF_PREP', 'STEP_BACK']),
  reason: z.string().min(10, 'Tell us a bit about why; helps us improve').max(500),
})

type Values = z.infer<typeof DecisionSchema>

export function DecisionPage() {
  const navigate = useNavigate()
  const submit = useRecordDecision()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(DecisionSchema),
  })
  const outcome = watch('outcome')

  const onSubmit = async (v: Values) => {
    await submit.mutateAsync(v)
    navigate('/', { replace: true })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Your decision</h1>
        <p className="mt-1 text-sm text-gray-600">
          After reviewing your report and Session 2, choose how you'd like to proceed.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <RadioCard
          {...register('outcome')}
          value="ENROL_FULL_SERVICE"
          selected={outcome === 'ENROL_FULL_SERVICE'}
          title="Enrol for full-service support"
          blurb="We guide you end-to-end through country mapping, applications, visa, and pre-departure."
        />
        <RadioCard
          {...register('outcome')}
          value="SELF_PREP"
          selected={outcome === 'SELF_PREP'}
          title="Prepare on your own"
          blurb="Use the report as your roadmap; come back when you're ready."
        />
        <RadioCard
          {...register('outcome')}
          value="STEP_BACK"
          selected={outcome === 'STEP_BACK'}
          title="Step back from study abroad"
          blurb="The report suggests a different path makes sense right now."
        />
        {errors.outcome && <p className="text-sm text-red-600">{errors.outcome.message}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700">Why this choice?</label>
          <textarea
            {...register('reason')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-500 focus:ring-navy-500"
          />
          {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>}
        </div>

        <Button type="submit" loading={isSubmitting}>
          Confirm decision
        </Button>
      </form>
    </div>
  )
}

const RadioCard = React.forwardRef<HTMLInputElement, any>(
  ({ value, selected, title, blurb, ...rest }, ref) => (
    <label className={`block cursor-pointer ${selected ? 'ring-2 ring-navy-500' : ''}`}>
      <Card>
        <CardBody className="flex items-start gap-3">
          <input ref={ref} type="radio" value={value} className="mt-1" {...rest} />
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{blurb}</p>
          </div>
        </CardBody>
      </Card>
    </label>
  )
)
```

## Hooks (file-per-query)

- `useJourney()` — GET `/portal/students/me/journey`, polls 10s when state is in `{ INTAKE_COMPLETE, AI_PRESCORED, GCRI_RUN }`
- `useStudentReport()` — GET `/portal/students/me/report`, polls 5s while `published_at` is null
- `useIntakeSubmission(id)` — GET `/portal/students/me/intake/{id}`
- `useIntakeForm(persona)` — GET `/portal/intake-form?persona=...`
- `useStartIntake()` — POST `/portal/students/me/intake/start`, invalidates `['journey']`
- `useSaveIntake(id)` — PATCH `/portal/students/me/intake/{id}`, debounced
- `useSubmitIntake(id)` — POST `/portal/students/me/intake/{id}/submit`, invalidates `['journey']`
- `useDocuments()` — GET `/portal/students/me/documents`
- `useDocumentRequirements()` — GET `/portal/students/me/documents/requirements`
- `useUploadDocument()` — POST multipart, invalidates `['documents']` + `['journey']`
- `useRecordDecision()` — POST `/portal/students/me/decision`, invalidates `['journey']`

All defined per the pattern in `docs/06-state-management.md`.
