# 10 — Advisor Console

> Single app (`apps/web`), role-gated routes. See [ADR-007](./ADR-007-single-app-merge.md)
> for the full rationale — this doc covers the advisor-facing screens that
> live under `apps/web/src/routes/advisor/`.

> For ADVISOR + SENIOR_ADVISOR. Other internal roles in `docs/11`.

## Screen map

These routes are defined in `apps/web/src/router.tsx` alongside the
student/parent and internal-ops routes, each wrapped in
`<RoleGate allow={ADVISOR_ROLES}>` (or `SENIOR_ROLES` for calibration —
both from `apps/web/src/lib/roles.ts`). Unauthorized roles are redirected
to `/forbidden`.

```
/login                          public — LoginPage (single login for all roles)
/                               authed — HomePage redirects ADVISOR/SENIOR_ADVISOR to /cases
/cases                          CaseQueuePage — RoleGate allow={ADVISOR_ROLES}
/students/:studentId            StudentDetailPage (tabbed) — RoleGate allow={ADVISOR_ROLES}
  ?tab=assessment               assessment + GCSS overrides
  ?tab=gcri                     GCRI per-country, override ±5
  ?tab=report                   report insight composer
  ?tab=audit                    full audit trail
  ?tab=sessions                 session 1 / session 2 records
/calibration                    weekly inter-rater cases — RoleGate allow={SENIOR_ROLES} (Phase 2 scope, stub in MVP)
```

## Layout shell — `apps/web/src/components/layout/AppShell.tsx`

There is no separate `AdvisorShell`. `<AppShell>` (`<SideNav>` + `<TopBar>`)
is shared across the whole app; `<SideNav>` filters which links render based
on the current user's `AppRole` (`@/lib/roles`), and `<TopBar>` shows the
role label and logout. The example below shows the advisor-relevant nav
items as they'd appear inside `<SideNav>`/`<TopBar>` for an ADVISOR or
SENIOR_ADVISOR user — it is illustrative of the role-aware rendering, not a
standalone shell component.

```tsx
// apps/web/src/components/layout/AppShell.tsx (advisor-relevant excerpt)
import { Outlet, NavLink } from 'react-router-dom'
import { ShieldCheck, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

export function AppShell() {
  const { user, logout } = useAuthStore()
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-navy-600" />
            <span className="font-semibold">ViaCerta</span>
            <span className="ml-3 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {roleLabel(user!.role)}
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <NavLink to="/cases" end className={navClass}>Cases</NavLink>
            {user!.role === 'SENIOR_ADVISOR' && (
              <NavLink to="/calibration" className={navClass}>Calibration</NavLink>
            )}
            <span className="text-gray-400">·</span>
            <span className="text-gray-700">{user!.fullName}</span>
            <button onClick={logout} className="text-gray-500 hover:text-gray-900">
              <LogOut className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'text-navy-700 font-medium' : 'text-gray-600 hover:text-gray-900'

function roleLabel(role: string) {
  return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}
```

`<SideNav>` (`apps/web/src/components/layout/SideNav.tsx`) renders "Cases"
and "Calibration" links only for users whose role is in `ADVISOR_ROLES` /
`SENIOR_ROLES` respectively — see `apps/web/src/lib/roles.ts`.

## Screen 1 — CaseQueuePage (`/cases`)

The advisor's primary workspace. URL-state-driven filters; polls every 30s when focused.

```tsx
// apps/web/src/routes/advisor/CaseQueuePage.tsx
import { useSearchParams, Link } from 'react-router-dom'
import { Card, CardBody, AsyncBoundary } from '@viacerta/ui'
import { GcssFlagBadge } from '@viacerta/ui/viacerta'
import { useAdvisorCases } from '@/features/cases/useCases'
import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, Clock } from 'lucide-react'

const STAGES = ['ALL', 'AI_PRESCORED', 'SESSION1_BOOKED', 'GCSS_CONFIRMED',
                'GAP_LOOP', 'GCRI_RUN', 'REPORT_BUILT'] as const

export function CaseQueuePage() {
  return (
    <AsyncBoundary>
      <Inner />
    </AsyncBoundary>
  )
}

function Inner() {
  const [params, setParams] = useSearchParams()
  const stage = params.get('stage') ?? 'ALL'
  const search = params.get('q') ?? ''

  const { data } = useAdvisorCases({ stage, search })
  if (!data) return null

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My cases</h1>
        <div className="text-sm text-gray-600">
          {data.total} {data.total === 1 ? 'student' : 'students'}
        </div>
      </header>

      <div className="flex items-center gap-2 overflow-x-auto">
        {STAGES.map((s) => (
          <button
            key={s}
            onClick={() => {
              const next = new URLSearchParams(params)
              if (s === 'ALL') next.delete('stage')
              else next.set('stage', s)
              setParams(next)
            }}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${
              stage === s ? 'bg-navy-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {stageLabel(s)}
          </button>
        ))}
      </div>

      <input
        type="search"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => {
          const next = new URLSearchParams(params)
          if (e.target.value) next.set('q', e.target.value)
          else next.delete('q')
          setParams(next)
        }}
        className="w-full rounded-md border-gray-300 text-sm focus:border-navy-500 focus:ring-navy-500"
      />

      <ul className="space-y-2">
        {data.cases.map((c) => (
          <li key={c.studentId}>
            <Link to={`/students/${c.studentId}`}>
              <Card className="hover:border-navy-300">
                <CardBody className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.studentName}</span>
                      {c.slaBreached && (
                        <span title="SLA breached"
                              className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">
                          <AlertTriangle className="h-3 w-3" />
                          Breached
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{c.email}</p>
                  </div>
                  <div className="hidden text-sm text-gray-700 md:block">
                    {stageLabel(c.currentStage)}
                  </div>
                  <div className="hidden text-sm text-gray-500 md:flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(c.lastActivityAt), { addSuffix: true })}
                  </div>
                  {c.gcssFlag && <GcssFlagBadge flag={c.gcssFlag} size="sm" />}
                </CardBody>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      {data.cases.length === 0 && (
        <p className="py-12 text-center text-sm text-gray-500">
          No cases match your filters.
        </p>
      )}
    </div>
  )
}

function stageLabel(s: string): string {
  switch (s) {
    case 'ALL':                return 'All'
    case 'AI_PRESCORED':       return 'Pre-scored · awaiting Session 1'
    case 'SESSION1_BOOKED':    return 'Session 1 booked'
    case 'GCSS_CONFIRMED':     return 'GCSS confirmed'
    case 'GAP_LOOP':           return 'Closing gaps'
    case 'GCRI_RUN':           return 'Running GCRI'
    case 'REPORT_BUILT':       return 'Report ready · awaiting Session 2'
    default:                   return s
  }
}
```

## Screen 2 — StudentDetailPage (`/students/:studentId`)

Tabbed shell. Tab switches via `?tab=` so deep-linking + back-button work.

```tsx
// apps/web/src/routes/advisor/StudentDetailPage.tsx
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { AsyncBoundary, Card, CardBody } from '@viacerta/ui'
import { useStudentDetail } from '@/features/student-detail/useStudentDetail'
import { AssessmentTab } from '@/features/assessment/AssessmentTab'
import { GcriTab } from '@/features/gcri/GcriTab'
import { ReportComposerTab } from '@/features/report-builder/ReportComposerTab'
import { AuditTab } from '@/features/audit/AuditTab'
import { SessionsTab } from '@/features/sessions/SessionsTab'

const TABS = [
  { key: 'assessment', label: 'Assessment' },
  { key: 'gcri',       label: 'Country risk' },
  { key: 'report',     label: 'Report' },
  { key: 'sessions',   label: 'Sessions' },
  { key: 'audit',      label: 'Audit' },
] as const

export function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') ?? 'assessment') as typeof TABS[number]['key']

  return (
    <AsyncBoundary>
      <Inner studentId={studentId!} tab={tab} setTab={(t) => {
        const next = new URLSearchParams(params)
        next.set('tab', t)
        setParams(next)
      }} />
    </AsyncBoundary>
  )
}

function Inner({
  studentId, tab, setTab,
}: { studentId: string; tab: string; setTab: (t: string) => void }) {
  const { data: student } = useStudentDetail(studentId)
  if (!student) return null

  return (
    <div className="space-y-4">
      <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
        ← Back to cases
      </Link>

      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{student.fullName}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {student.email} · {student.phone ?? '—'} · {student.persona}
          </p>
        </div>
        <div className="text-right text-sm">
          <div className="text-gray-500">Current stage</div>
          <div className="font-medium">{student.currentStateCode}</div>
        </div>
      </header>

      <nav className="flex items-center gap-6 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 py-3 text-sm ${
              tab === t.key
                ? 'border-navy-600 text-navy-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section>
        {tab === 'assessment' && <AssessmentTab studentId={studentId} />}
        {tab === 'gcri'       && <GcriTab studentId={studentId} />}
        {tab === 'report'     && <ReportComposerTab studentId={studentId} />}
        {tab === 'sessions'   && <SessionsTab studentId={studentId} />}
        {tab === 'audit'      && <AuditTab studentId={studentId} />}
      </section>
    </div>
  )
}
```

## Tab 1 — AssessmentTab

Shows full assessment with per-sub-component scores, anchors, AI rationale, override controls, confirm button.

```tsx
// apps/web/src/features/assessment/AssessmentTab.tsx
import { useState } from 'react'
import { Card, CardBody, Button } from '@viacerta/ui'
import { GcssFlagBadge, ScoreGauge, EvidenceLevelBadge } from '@viacerta/ui/viacerta'
import { useAssessment } from './useAssessment'
import { useConfirmAssessment } from './useConfirmAssessment'
import { OverrideDialog } from './OverrideDialog'
import { formatDistanceToNow } from 'date-fns'

export function AssessmentTab({ studentId }: { studentId: string }) {
  const { data: assessment } = useAssessment(studentId)
  const confirm = useConfirmAssessment(studentId)
  const [overrideTarget, setOverrideTarget] =
    useState<null | { dimension: string; subKey: string; current: number; max: number; label: string }>(null)

  if (!assessment) return null

  const isLocked = assessment.status === 'CONFIRMED'

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
          <ScoreGauge value={assessment.gcssFinal ?? 0} size={140} />
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-semibold">{assessment.gcssFinal ?? '—'}</span>
              {assessment.gcssFlag && <GcssFlagBadge flag={assessment.gcssFlag} size="md" />}
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs uppercase tracking-wide text-gray-600">
                {assessment.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Raw {assessment.gcssRaw} · multiplier{' '}
              {assessment.confidenceMultiplier?.toFixed(2) ?? '—'}{' '}
              · rubric v{assessment.rubricVersion}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              AI {assessment.aiContributionPct.toFixed(0)}% · advisor {assessment.humanContributionPct.toFixed(0)}%
            </p>
          </div>
          {!isLocked && (
            <Button
              onClick={() => confirm.mutate()}
              loading={confirm.isPending}
              disabled={assessment.confidenceMultiplier === null}
              title={
                assessment.confidenceMultiplier === null
                  ? 'Cannot confirm: required documents not verified'
                  : undefined
              }
            >
              Confirm assessment
            </Button>
          )}
        </CardBody>
      </Card>

      {assessment.dimensionScores.map((dim) => (
        <Card key={dim.dimension}>
          <CardBody>
            <header className="flex items-baseline justify-between">
              <h3 className="font-semibold">{dimensionLabel(dim.dimension)}</h3>
              <div className="text-right">
                <span className="text-2xl font-semibold">{dim.raw.toFixed(1)}</span>
                <span className="text-sm text-gray-500"> / {dim.max}</span>
                {dim.overrideDelta !== 0 && (
                  <div className="text-xs text-amber-700">
                    Override {dim.overrideDelta > 0 ? '+' : ''}{dim.overrideDelta.toFixed(1)}
                  </div>
                )}
              </div>
            </header>

            <ul className="mt-3 divide-y border-t">
              {dim.subScores.map((s) => (
                <li key={s.subComponentKey} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 py-3 text-sm">
                  <div>
                    <div className="font-medium">{s.label}</div>
                    {s.anchorMatched && (
                      <div className="mt-0.5 text-xs text-gray-500">
                        Matched <span className="font-medium">{s.anchorMatched}</span> · {s.rationale}
                      </div>
                    )}
                  </div>
                  <EvidenceLevelBadge level={s.evidenceLevel} />
                  <div className="text-right">
                    <span className="font-medium">{s.raw.toFixed(1)}</span>
                    <span className="text-gray-500"> / {s.max}</span>
                  </div>
                  {!isLocked && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOverrideTarget({
                        dimension: dim.dimension,
                        subKey: s.subComponentKey,
                        current: s.raw,
                        max: s.max,
                        label: s.label,
                      })}
                    >
                      Override
                    </Button>
                  )}
                </li>
              ))}
            </ul>

            {dim.overrideEvidence && (
              <p className="mt-3 rounded bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <strong>Override evidence:</strong> {dim.overrideEvidence}
                {dim.overriddenAt && (
                  <span className="text-amber-600">
                    {' '}— {formatDistanceToNow(new Date(dim.overriddenAt), { addSuffix: true })}
                  </span>
                )}
              </p>
            )}
          </CardBody>
        </Card>
      ))}

      {overrideTarget && (
        <OverrideDialog
          studentId={studentId}
          target={overrideTarget}
          onClose={() => setOverrideTarget(null)}
        />
      )}
    </div>
  )
}

function dimensionLabel(key: string): string {
  switch (key) {
    case 'ACADEMIC_AND_COGNITIVE_READINESS': return 'Academic & Cognitive Readiness'
    case 'SKILL_BASELINE':                   return 'Skill Baseline'
    case 'FINANCIAL_STABILITY':              return 'Financial Stability'
    case 'CAREER_CLARITY':                   return 'Career Clarity'
    case 'RISK_AND_ADAPTABILITY_MINDSET':    return 'Risk & Adaptability Mindset'
    default:                                 return key
  }
}
```

`OverrideDialog` is the full Radix Dialog + RHF + zod component from `docs/07-forms-and-validation.md` — refer there.

## Tab 2 — GcriTab

```tsx
// apps/web/src/features/gcri/GcriTab.tsx
import { Card, CardBody, Button } from '@viacerta/ui'
import { RiskBandPill } from '@viacerta/ui/viacerta'
import { useGcriResults } from './useGcriResults'
import { useTriggerGcri } from './useTriggerGcri'
import { GcriOverrideDialog } from './GcriOverrideDialog'
import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

export function GcriTab({ studentId }: { studentId: string }) {
  const { data } = useGcriResults(studentId)
  const trigger = useTriggerGcri(studentId)
  const [overrideCountry, setOverrideCountry] = useState<string | null>(null)

  if (!data) return null

  if (data.results.length === 0) {
    return (
      <Card>
        <CardBody className="space-y-3">
          <h3 className="font-medium">No GCRI run yet</h3>
          <p className="text-sm text-gray-600">
            Trigger a run against the student's target countries. Requires GCSS ≥ 60 (current: {data.gcssFinal ?? '—'}).
          </p>
          <Button
            onClick={() => trigger.mutate({ countries: data.targetCountries, vertical: data.careerVertical })}
            disabled={(data.gcssFinal ?? 0) < 60 || trigger.isPending}
            loading={trigger.isPending}
          >
            Run GCRI for {data.targetCountries.join(', ')}
          </Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {data.results.map((r) => (
        <Card key={r.country}>
          <CardBody>
            <header className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{countryLabel(r.country)}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Matrix v{r.matrixVersion} · {r.dataSparseFlag && (
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      <AlertCircle className="h-3 w-3" /> Data sparse
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-semibold">{r.finalScore.toFixed(0)}</div>
                <RiskBandPill band={r.riskBand} />
              </div>
            </header>

            <p className="mt-3 text-xs text-gray-500">
              Base {r.baseScore.toFixed(1)} · overlay {r.overlayDelta > 0 ? '+' : ''}{r.overlayDelta.toFixed(1)}
              {r.advisorOverrideDelta !== 0 && (
                <> · override {r.advisorOverrideDelta > 0 ? '+' : ''}{r.advisorOverrideDelta.toFixed(1)}</>
              )}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              {r.factorScores.map((f) => (
                <div key={f.factor} className="rounded bg-gray-50 p-2">
                  <div className="text-gray-500">{factorLabel(f.factor)}</div>
                  <div className="font-medium">{f.weighted.toFixed(1)} / {f.max}</div>
                </div>
              ))}
            </div>

            {/* Phase 3 #1 — see docs/12-visualization.md "Outcome prediction band". Renders
                outcomeProbability(Low|High) as a range + outcomeConfidenceLevel as "X/10". */}
            {r.outcomeProbability != null && (
              <div className="mt-3">
                <OutcomePredictionBand
                  probability={r.outcomeProbability}
                  probabilityLow={r.outcomeProbabilityLow}
                  probabilityHigh={r.outcomeProbabilityHigh}
                  confidenceLevel={r.outcomeConfidenceLevel}
                  modelVersion={r.outcomeProbabilityModelVersion}
                  rationale={r.outcomeProbabilityRationale}
                />
              </div>
            )}

            <div className="mt-3">
              <Button variant="ghost" size="sm" onClick={() => setOverrideCountry(r.country)}>
                Override ±5
              </Button>
            </div>
          </CardBody>
        </Card>
      ))}

      {overrideCountry && (
        <GcriOverrideDialog
          studentId={studentId}
          country={overrideCountry}
          onClose={() => setOverrideCountry(null)}
        />
      )}
    </div>
  )
}

function countryLabel(code: string): string {
  return ({ US: 'United States', DE: 'Germany', NL: 'Netherlands', GB: 'United Kingdom',
           CA: 'Canada', AU: 'Australia' } as Record<string, string>)[code] ?? code
}

function factorLabel(f: string): string {
  return f.split('_').map(w => w[0] + w.slice(1).toLowerCase()).join(' ')
}
```

## Tab 3 — ReportComposerTab

```tsx
// apps/web/src/features/report-builder/ReportComposerTab.tsx
import { Card, CardBody, Button } from '@viacerta/ui'
import { useBuildReport } from './useBuildReport'
import { usePublishReport } from './usePublishReport'
import { InsightEditor } from './InsightEditor'

const SECTIONS = [
  'EXECUTIVE_SUMMARY',
  'GCSS_BREAKDOWN',
  'GCRI_BREAKDOWN',
  'ROI_ANALYSIS',
  'RISK_REGISTER',
  'NINETY_DAY_PLAN',
] as const

export function ReportComposerTab({ studentId }: { studentId: string }) {
  const { data: report } = useBuildReport(studentId)
  const publish = usePublishReport(studentId)
  if (!report) return null

  const isPublished = report.publishedAt !== null
  const insightsBySection = Object.fromEntries(
    SECTIONS.map((s) => [s, report.advisorInsights.find((i) => i.section === s)?.text ?? '']),
  )
  const allComplete = SECTIONS.every((s) => insightsBySection[s].trim().length > 0)

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Report composer</h2>
          <p className="text-sm text-gray-600">
            Author six advisor insights, then publish to the student.
          </p>
        </div>
        {!isPublished ? (
          <Button
            disabled={!allComplete}
            onClick={() => publish.mutate()}
            loading={publish.isPending}
            title={allComplete ? '' : 'All six sections must have at least one insight'}
          >
            Publish report
          </Button>
        ) : (
          <span className="rounded bg-green-50 px-3 py-1 text-sm text-green-700">
            Published
          </span>
        )}
      </header>

      <div className="space-y-3">
        {SECTIONS.map((s) => (
          <Card key={s}>
            <CardBody>
              <h3 className="font-medium">{sectionLabel(s)}</h3>
              <InsightEditor
                studentId={studentId}
                section={s}
                initialText={insightsBySection[s]}
                disabled={isPublished}
              />
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}

function sectionLabel(s: string): string {
  switch (s) {
    case 'EXECUTIVE_SUMMARY':  return 'Executive summary'
    case 'GCSS_BREAKDOWN':     return 'Sustainability score breakdown'
    case 'GCRI_BREAKDOWN':     return 'Country-risk analysis'
    case 'ROI_ANALYSIS':       return 'ROI analysis'
    case 'RISK_REGISTER':      return 'Risk register'
    case 'NINETY_DAY_PLAN':    return '90-day plan'
  }
}
```

`InsightEditor` is a RHF + zod form with sentence-count validation (1–3 sentences, see `docs/07-forms-and-validation.md`). Updates via `PUT /advisor/students/{id}/report/insight/{section}`.

## Tab 4 — SessionsTab

```tsx
// apps/web/src/features/sessions/SessionsTab.tsx
import { Card, CardBody, Button } from '@viacerta/ui'
import { useSessions } from './useSessions'
import { useRecordSession } from './useRecordSession'
import { format } from 'date-fns'
import { useState } from 'react'

export function SessionsTab({ studentId }: { studentId: string }) {
  const { data: sessions } = useSessions(studentId)
  const [composing, setComposing] = useState<null | 'SESSION_1' | 'SESSION_2'>(null)

  if (!sessions) return null

  const session1 = sessions.find((s) => s.type === 'SESSION_1')
  const session2 = sessions.find((s) => s.type === 'SESSION_2')

  return (
    <div className="space-y-4">
      <SessionCard
        label="Session 1 — GCSS confirmation"
        session={session1}
        onRecord={() => setComposing('SESSION_1')}
      />
      <SessionCard
        label="Session 2 — Report walkthrough"
        session={session2}
        onRecord={() => setComposing('SESSION_2')}
        disabled={!session1?.endedAt}
      />
      {composing && (
        <RecordSessionDialog
          studentId={studentId}
          type={composing}
          onClose={() => setComposing(null)}
        />
      )}
    </div>
  )
}

function SessionCard({ label, session, onRecord, disabled }: {
  label: string; session?: any; onRecord: () => void; disabled?: boolean;
}) {
  return (
    <Card>
      <CardBody className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium">{label}</h3>
          {session?.endedAt ? (
            <p className="mt-1 text-sm text-gray-600">
              Recorded {format(new Date(session.endedAt), 'PP')} ·{' '}
              {session.parentJoined ? 'Parent joined' : 'Student only'}
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">Not yet recorded.</p>
          )}
        </div>
        {!session?.endedAt && (
          <Button onClick={onRecord} variant="outline" disabled={disabled}>
            Record
          </Button>
        )}
      </CardBody>
    </Card>
  )
}
```

`RecordSessionDialog` collects start/end timestamps + parent_joined + notes; POST `/advisor/students/{id}/sessions`.

## Tab 5 — AuditTab

```tsx
// apps/web/src/features/audit/AuditTab.tsx
import { Card, CardBody, AsyncBoundary } from '@viacerta/ui'
import { useAudit } from './useAudit'
import { format } from 'date-fns'

export function AuditTab({ studentId }: { studentId: string }) {
  return (
    <AsyncBoundary>
      <Inner studentId={studentId} />
    </AsyncBoundary>
  )
}

function Inner({ studentId }: { studentId: string }) {
  const { data: rows } = useAudit({ entityType: 'Student', entityId: studentId })
  if (!rows) return null

  return (
    <Card>
      <CardBody>
        <ul className="divide-y">
          {rows.map((r) => (
            <li key={r.id} className="py-3 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium">{actionLabel(r.action)}</span>
                <time className="text-xs text-gray-500">
                  {format(new Date(r.createdAt), 'PPpp')}
                </time>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                By {r.actorName ?? 'system'}
              </p>
              {r.evidence && (
                <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">
                  {r.evidence}
                </p>
              )}
              {(r.before || r.after) && (
                <pre className="mt-2 overflow-x-auto rounded bg-gray-50 p-2 text-xs">
                  {JSON.stringify({ before: r.before, after: r.after }, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ul>
        {rows.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500">No audit events yet.</p>
        )}
      </CardBody>
    </Card>
  )
}

function actionLabel(a: string): string {
  return a.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}
```

## Hooks summary

All hooks call `apiClient` from `@viacerta/api-client` and live alongside
their feature components under `apps/web/src/features/`. Endpoint paths
below are unchanged backend routes (`/api/v1/advisor/...`).

| Hook | Feature folder | Endpoint | Cache key |
|---|---|---|---|
| `useAdvisorCases({stage, search})` | `features/cases` | GET `/advisor/cases` | `['advisor', 'cases', filters]` |
| `useStudentDetail(id)` | `features/student-detail` | GET `/advisor/students/{id}` | `['advisor', 'student', id]` |
| `useAssessment(id)` | `features/assessment` | GET `/advisor/students/{id}/assessment` | `['advisor', 'assessment', id]` |
| `useGcssOverride(id)` | `features/assessment` | POST override | invalidates `['advisor', 'assessment', id]` |
| `useConfirmAssessment(id)` | `features/assessment` | POST confirm | invalidates `['advisor', 'assessment', id]` + journey |
| `useGcriResults(id)` | `features/gcri` | GET `/advisor/students/{id}/gcri` | `['advisor', 'gcri', id]` |
| `useTriggerGcri(id)` | `features/gcri` | POST trigger | invalidates `['advisor', 'gcri', id]` |
| `useGcriOverride(id, country)` | `features/gcri` | POST override | invalidates `['advisor', 'gcri', id]` |
| `useBuildReport(id)` | `features/report-builder` | GET `/advisor/students/{id}/report` | `['advisor', 'report', id]` |
| `useAddInsight(id, section)` | `features/report-builder` | PUT insight | optimistic update on `['advisor', 'report', id]` |
| `usePublishReport(id)` | `features/report-builder` | POST publish | invalidates report + journey |
| `useSessions(id)` | `features/sessions` | GET sessions | `['advisor', 'sessions', id]` |
| `useRecordSession(id)` | `features/sessions` | POST session | invalidates sessions + journey |
| `useAudit({entityType, entityId})` | `features/audit` | GET audit | `['advisor', 'audit', type, id]` |
