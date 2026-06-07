# 11 — Internal Ops Screens

> `apps/advisor` (same app, role-gated routes) for COORDINATOR, APPS_OPS, VISA_OPS, CAREER_SERVICES, DATA_OPS, ADMIN.

## Route map (additions to advisor app)

```
/ops/leads                       COORDINATOR, ADMIN — unassigned leads + assignment
/ops/documents                   APPS_OPS, VISA_OPS, ADMIN — document verification queue
/ops/data                        DATA_OPS, ADMIN — matrix versions + freshness + downgrades
/ops/outcomes                    CAREER_SERVICES, ADMIN — outcome capture
/ops/users                       ADMIN — user + role management
```

`RoleGate` (defined in `docs/05-auth-and-routing.md`) wraps every `/ops/*` route. A user without the right role gets the `403` screen, not a redirect — so the link never accidentally renders.

## Screen — Lead intake queue (`/ops/leads`)

Coordinator's main view: leads coming in, advisor capacity, drag-to-assign.

```tsx
// apps/advisor/src/routes/ops/LeadsPage.tsx
import { Card, CardBody, Button, AsyncBoundary } from '@viacerta/ui'
import { useLeads } from '@/hooks/use-leads'
import { useAdvisors } from '@/hooks/use-advisors'
import { useAssignAdvisor } from '@/hooks/use-assign-advisor'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'

export function LeadsPage() {
  return (
    <AsyncBoundary>
      <Inner />
    </AsyncBoundary>
  )
}

function Inner() {
  const { data: leads } = useLeads()
  const { data: advisors } = useAdvisors()
  const assign = useAssignAdvisor()
  const [selectedLead, setSelectedLead] = useState<string | null>(null)

  if (!leads || !advisors) return null

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Lead intake</h1>
        <p className="mt-1 text-sm text-gray-600">
          {leads.length} unassigned · oldest{' '}
          {leads[0] ? formatDistanceToNow(new Date(leads[0].registeredAt), { addSuffix: true }) : '—'}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <Card>
          <CardBody className="p-0">
            <ul className="divide-y">
              {leads.map((lead) => (
                <li
                  key={lead.id}
                  className={`flex items-center justify-between gap-3 p-4 hover:bg-gray-50 ${
                    selectedLead === lead.id ? 'bg-navy-50' : ''
                  }`}
                  onClick={() => setSelectedLead(lead.id)}
                >
                  <div>
                    <div className="font-medium">{lead.fullName}</div>
                    <div className="mt-0.5 text-xs text-gray-500">
                      {lead.email} · {lead.persona ?? '—'}
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {formatDistanceToNow(new Date(lead.registeredAt), { addSuffix: true })}
                  </div>
                </li>
              ))}
              {leads.length === 0 && (
                <li className="py-12 text-center text-sm text-gray-500">
                  No unassigned leads.
                </li>
              )}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="font-medium">Advisor capacity</h3>
            <ul className="mt-3 space-y-2">
              {advisors.map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{a.fullName}</div>
                    <div className="text-xs text-gray-500">
                      {a.activeCases} / {a.capacity} active
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!selectedLead || a.activeCases >= a.capacity}
                    onClick={() => assign.mutate({
                      studentId: selectedLead!,
                      advisorId: a.id,
                    })}
                  >
                    Assign
                  </Button>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
```

## Screen — Document verification (`/ops/documents`)

Operator queue: pending documents, side-by-side preview, evidence-level + verify/reject actions.

```tsx
// apps/advisor/src/routes/ops/DocumentVerificationPage.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardBody, Button, AsyncBoundary } from '@viacerta/ui'
import { EvidenceLevelBadge } from '@viacerta/ui/viacerta'
import { usePendingDocuments } from '@/hooks/use-pending-documents'
import { useVerifyDocument } from '@/hooks/use-verify-document'
import { useRejectDocument } from '@/hooks/use-reject-document'
import { format } from 'date-fns'

const RejectSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
})

const EVIDENCE_LEVELS = ['L2', 'L3', 'L4', 'L5'] as const

export function DocumentVerificationPage() {
  return (
    <AsyncBoundary>
      <Inner />
    </AsyncBoundary>
  )
}

function Inner() {
  const { data: documents } = usePendingDocuments()
  const verify = useVerifyDocument()
  const reject = useRejectDocument()
  const [selected, setSelected] = useState<string | null>(null)
  const [showReject, setShowReject] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<{ reason: string }>({ resolver: zodResolver(RejectSchema) })

  if (!documents) return null
  const current = documents.find((d) => d.id === selected) ?? documents[0]

  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <Card>
        <CardBody className="p-0">
          <ul className="divide-y">
            {documents.map((d) => (
              <li
                key={d.id}
                onClick={() => setSelected(d.id)}
                className={`cursor-pointer p-3 text-sm hover:bg-gray-50 ${
                  current?.id === d.id ? 'bg-navy-50' : ''
                }`}
              >
                <div className="font-medium">{d.studentName}</div>
                <div className="mt-0.5 text-xs text-gray-500">
                  {d.kind} · uploaded {format(new Date(d.uploadedAt), 'PP')}
                </div>
              </li>
            ))}
          </ul>
          {documents.length === 0 && (
            <p className="p-6 text-center text-sm text-gray-500">Queue is empty.</p>
          )}
        </CardBody>
      </Card>

      {current && (
        <Card>
          <CardBody className="space-y-4">
            <header className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{current.kind}</h2>
                <p className="text-sm text-gray-600">{current.studentName}</p>
              </div>
              <EvidenceLevelBadge level={current.currentEvidenceLevel} />
            </header>

            <div className="aspect-[4/5] w-full overflow-hidden rounded border bg-gray-50">
              {current.contentType === 'application/pdf' ? (
                <iframe src={current.previewUrl} className="h-full w-full" title="Document preview" />
              ) : (
                <img src={current.previewUrl} alt="Document" className="h-full w-full object-contain" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Verify at evidence level
              </label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {EVIDENCE_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => verify.mutate({ documentId: current.id, evidenceLevel: lvl })}
                    className="rounded border border-gray-300 px-3 py-2 text-sm hover:border-navy-500 hover:bg-navy-50"
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                L5 = original verified · L4 = certified copy · L3 = self-uploaded readable · L2 = unclear/incomplete
              </p>
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <Button
                variant="ghost"
                className="text-red-600 hover:bg-red-50"
                onClick={() => setShowReject(true)}
              >
                Reject document
              </Button>
            </div>

            {showReject && (
              <form
                onSubmit={handleSubmit(async (v) => {
                  await reject.mutateAsync({ documentId: current.id, reason: v.reason })
                  setShowReject(false)
                  reset()
                })}
                className="space-y-2 rounded border border-red-200 bg-red-50 p-3"
              >
                <label className="block text-sm font-medium text-red-800">
                  Rejection reason (visible to student)
                </label>
                <textarea
                  {...register('reason')}
                  rows={3}
                  className="block w-full rounded-md border-red-300 text-sm"
                />
                {errors.reason && <p className="text-xs text-red-700">{errors.reason.message}</p>}
                <div className="flex gap-2">
                  <Button type="submit" loading={isSubmitting} variant="destructive">
                    Reject
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowReject(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
```

## Screen — Data ops (`/ops/data`)

Two surfaces:

1. **Matrix freshness**: per-(vertical × country) cell with `last_refresh_at`, `data_points`, stale-flag
2. **Version management**: publish + activate matrix versions, hard-coded downgrades with evidence

```tsx
// apps/advisor/src/routes/ops/DataOpsPage.tsx
import { Card, CardBody, Button, AsyncBoundary } from '@viacerta/ui'
import { useMatrixVersions } from '@/hooks/use-matrix-versions'
import { useMatrixFreshness } from '@/hooks/use-matrix-freshness'
import { useActivateMatrix } from '@/hooks/use-activate-matrix'
import { format, differenceInDays } from 'date-fns'
import { useState } from 'react'
import { DowngradeDialog } from '@/features/data-ops/DowngradeDialog'

export function DataOpsPage() {
  return (
    <AsyncBoundary>
      <Inner />
    </AsyncBoundary>
  )
}

function Inner() {
  const { data: versions } = useMatrixVersions()
  const { data: freshness } = useMatrixFreshness()
  const activate = useActivateMatrix()
  const [downgradeTarget, setDowngradeTarget] = useState<null | { vertical: string; country: string }>(null)

  if (!versions || !freshness) return null
  const active = versions.find((v) => v.isActive)

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold">GCRI matrix</h1>
          <p className="mt-1 text-sm text-gray-600">
            Active: <span className="font-mono">{active?.version ?? '—'}</span> · published{' '}
            {active ? format(new Date(active.publishedAt), 'PP') : '—'}
          </p>
        </div>
        <a href="https://github.com/viacerta/data-ops" className="text-sm text-navy-700 underline">
          Adapter source
        </a>
      </header>

      <Card>
        <CardBody>
          <h2 className="font-medium">Cell freshness</h2>
          <p className="mt-1 text-xs text-gray-500">
            Stale = older than 90 days OR data_points &lt; 30
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2">Vertical</th>
                  <th className="px-3 py-2">Country</th>
                  <th className="px-3 py-2 text-right">Data pts</th>
                  <th className="px-3 py-2">Refreshed</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {freshness.cells.map((c) => {
                  const ageDays = differenceInDays(new Date(), new Date(c.lastRefreshAt))
                  const isStale = ageDays > 90 || c.dataPoints < 30
                  return (
                    <tr key={`${c.vertical}-${c.country}`}>
                      <td className="px-3 py-2">{c.vertical}</td>
                      <td className="px-3 py-2">{c.country}</td>
                      <td className="px-3 py-2 text-right">{c.dataPoints}</td>
                      <td className="px-3 py-2 text-gray-600">{ageDays}d ago</td>
                      <td className="px-3 py-2">
                        {isStale ? (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">Stale</span>
                        ) : (
                          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">Fresh</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => setDowngradeTarget({ vertical: c.vertical, country: c.country })}
                          className="text-xs text-navy-700 hover:underline"
                        >
                          Downgrade
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="font-medium">Versions</h2>
          <ul className="mt-3 divide-y">
            {versions.map((v) => (
              <li key={v.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-mono text-sm">{v.version}</div>
                  <div className="text-xs text-gray-500">
                    {v.publishedAt
                      ? `Published ${format(new Date(v.publishedAt), 'PP')}`
                      : 'Draft'}
                    {v.notes && ` · ${v.notes}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {v.isActive ? (
                    <span className="rounded bg-green-50 px-2 py-1 text-xs text-green-700">Active</span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => activate.mutate({ matrixVersionId: v.id })}
                    >
                      Activate
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      {downgradeTarget && (
        <DowngradeDialog target={downgradeTarget} onClose={() => setDowngradeTarget(null)} />
      )}
    </div>
  )
}
```

`DowngradeDialog` is RHF + zod with `factor` select, `newRawValue` number, `evidenceNote` (min 10 chars). POST `/advisor/ops/data/matrix/downgrade`.

## Screen — Outcome capture (`/ops/outcomes`)

Career Services / Admin records Year-1 and Year-3 outcomes for past students. Feeds the calibration loop (`docs/14-development-roadmap.md` phase 3).

```tsx
// apps/advisor/src/routes/ops/OutcomesPage.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardBody, Button, Input, AsyncBoundary } from '@viacerta/ui'
import { useOutcomeBacklog, useRecordOutcome } from '@/hooks/use-outcomes'
import { useState } from 'react'

const OutcomeSchema = z.object({
  studentId: z.string(),
  measuredAt: z.enum(['YEAR_1', 'YEAR_3']),
  employed: z.boolean(),
  employerName: z.string().optional(),
  roleTitle: z.string().optional(),
  salaryAmount: z.number().nonnegative().optional(),
  salaryCurrency: z.string().length(3).optional(),
  inFieldMatch: z.boolean(),
  inCountry: z.string().length(2).optional(),
  notes: z.string().max(1000).optional(),
})

type Values = z.infer<typeof OutcomeSchema>

export function OutcomesPage() {
  return (
    <AsyncBoundary>
      <Inner />
    </AsyncBoundary>
  )
}

function Inner() {
  const { data: backlog } = useOutcomeBacklog()
  const record = useRecordOutcome()
  const [target, setTarget] = useState<null | { studentId: string; measuredAt: 'YEAR_1' | 'YEAR_3' }>(null)

  const form = useForm<Values>({ resolver: zodResolver(OutcomeSchema) })

  if (!backlog) return null

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_400px]">
      <Card>
        <CardBody>
          <h2 className="font-medium">Backlog</h2>
          <ul className="mt-3 divide-y">
            {backlog.entries.map((b) => (
              <li key={`${b.studentId}-${b.measuredAt}`} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-medium">{b.studentName}</div>
                  <div className="text-xs text-gray-500">
                    {b.targetCountry} · {b.measuredAt} · enrolled {b.enrolledAt}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTarget({ studentId: b.studentId, measuredAt: b.measuredAt })
                    form.reset({ studentId: b.studentId, measuredAt: b.measuredAt, inFieldMatch: false, employed: false })
                  }}
                >
                  Record
                </Button>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      {target && (
        <Card>
          <CardBody>
            <h3 className="font-medium">Record outcome</h3>
            <form
              onSubmit={form.handleSubmit(async (v) => {
                await record.mutateAsync(v)
                setTarget(null)
                form.reset()
              })}
              className="mt-3 space-y-3"
            >
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register('employed')} />
                Employed
              </label>
              <Input label="Employer" {...form.register('employerName')} />
              <Input label="Role" {...form.register('roleTitle')} />
              <div className="grid grid-cols-2 gap-2">
                <Input label="Salary" type="number"
                       {...form.register('salaryAmount', { valueAsNumber: true })} />
                <Input label="Currency" placeholder="EUR" {...form.register('salaryCurrency')} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register('inFieldMatch')} />
                In-field role (matched career goal)
              </label>
              <Input label="Country (ISO 2)" placeholder="DE" {...form.register('inCountry')} />
              <textarea
                {...form.register('notes')}
                rows={2}
                placeholder="Notes"
                className="w-full rounded-md border-gray-300 text-sm"
              />
              <div className="flex gap-2">
                <Button type="submit" loading={form.formState.isSubmitting}>Save</Button>
                <Button type="button" variant="ghost" onClick={() => setTarget(null)}>Cancel</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
```

## Screen — User management (`/ops/users`, ADMIN only)

```tsx
// apps/advisor/src/routes/ops/UsersPage.tsx
import { Card, CardBody, Button, Input, AsyncBoundary } from '@viacerta/ui'
import { useUsers, useChangeRole, useDeactivateUser } from '@/hooks/use-users'
import { useState } from 'react'

const ROLES = [
  'STUDENT', 'PARENT', 'ADVISOR', 'SENIOR_ADVISOR',
  'COORDINATOR', 'APPS_OPS', 'VISA_OPS', 'CAREER_SERVICES',
  'DATA_OPS', 'ADMIN',
] as const

export function UsersPage() {
  return (
    <AsyncBoundary>
      <Inner />
    </AsyncBoundary>
  )
}

function Inner() {
  const [q, setQ] = useState('')
  const { data: users } = useUsers({ search: q })
  const changeRole = useChangeRole()
  const deactivate = useDeactivateUser()

  if (!users) return null

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold">Users</h1>
      </header>

      <Input
        placeholder="Search by name or email…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <Card>
        <CardBody className="p-0">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-3 py-2 font-medium">{u.fullName}</td>
                  <td className="px-3 py-2 text-gray-600">{u.email}</td>
                  <td className="px-3 py-2">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole.mutate({ userId: u.id, role: e.target.value as any })}
                      className="rounded border-gray-300 text-sm"
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    {u.isActive ? <span className="text-green-700">Yes</span> : <span className="text-gray-400">No</span>}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {u.isActive && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm(`Deactivate ${u.fullName}?`)) deactivate.mutate({ userId: u.id })
                        }}
                      >
                        Deactivate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  )
}
```

## Hooks summary

| Hook | Endpoint | Role |
|---|---|---|
| `useLeads()` | GET `/advisor/ops/leads` | COORDINATOR, ADMIN |
| `useAssignAdvisor()` | POST `/advisor/ops/leads/{id}/assign` | COORDINATOR, ADMIN |
| `useAdvisors()` | GET `/advisor/ops/advisors` | COORDINATOR, ADMIN |
| `usePendingDocuments()` | GET `/advisor/ops/documents/pending` | APPS_OPS, VISA_OPS, ADMIN |
| `useVerifyDocument()` | POST `/advisor/ops/documents/{id}/verify` | same |
| `useRejectDocument()` | POST `/advisor/ops/documents/{id}/reject` | same — evidence required |
| `useMatrixVersions()` | GET `/advisor/ops/data/matrix/versions` | DATA_OPS, ADMIN |
| `useMatrixFreshness()` | GET `/advisor/ops/data/matrix/freshness` | DATA_OPS, ADMIN |
| `useActivateMatrix()` | POST `/advisor/ops/data/matrix/{id}/activate` | DATA_OPS, ADMIN |
| `useDowngradeMatrix()` | POST `/advisor/ops/data/matrix/downgrade` | SENIOR_ADVISOR, DATA_OPS — evidence required |
| `useOutcomeBacklog()` | GET `/advisor/ops/outcomes/backlog` | CAREER_SERVICES, ADMIN |
| `useRecordOutcome()` | POST `/advisor/ops/outcomes` | CAREER_SERVICES, ADMIN |
| `useUsers()` | GET `/advisor/ops/users` | ADMIN |
| `useChangeRole()` | POST `/advisor/ops/users/{id}/role` | ADMIN |
| `useDeactivateUser()` | POST `/advisor/ops/users/{id}/deactivate` | ADMIN |
