# ADR-006 — react-hook-form + zod (for every form)

**Status**: Accepted
**Date**: 2026-06-04
**Deciders**: Gautam (founder / eng lead)

## Context

The frontend has several forms with non-trivial behaviour:

- **Register / login** — standard validation, server error mapping, password complexity rules
- **Intake form** — large (30+ questions), persona-routed, must save-and-resume across sessions, debounced server sync
- **OverrideDialog** (advisor) — strict validation: evidence note ≥ 10 chars, score within [0, max], mirrored from backend `OverrideRequest` Pydantic schema
- **InsightEditor** (advisor) — sentence-count validation (1–3 sentences per insight), per-section persistence
- **DecisionGate** — three-option radio + reason text
- **DocumentVerification** — evidence-level selector + rejection reason
- **Hardcoded matrix downgrade** — factor select + new raw value + evidence note

Every one of these has: client-side validation, server-side validation (RFC 7807 returns), error display, async submission, sometimes optimistic updates.

## Decision

- **react-hook-form** for every form. No raw `useState` for form fields, no Formik, no Final Form.
- **zod** for every schema. No Yup, no Joi, no hand-written validators.
- **`@hookform/resolvers/zod`** to glue them.
- A custom ESLint rule (Phase 2) blocks `useState` for ≥ 2 controlled field values in a JSX subtree.

All forms follow the canonical pattern in `docs/07-forms-and-validation.md`.

## Rationale

### Why react-hook-form

- **Surgical re-renders**. RHF uses uncontrolled inputs by default; only the field that changes re-renders, not the whole form. The intake form has 30+ inputs; with Formik or naive `useState`, every keystroke re-renders all of them.
- **`register` API is concise**. `<input {...register('email')} />` does everything: name, value, onChange, ref, validation hook.
- **Native form integration**. RHF respects native `<form>` semantics — `onSubmit` is real, native validation can be opted into for the cases it makes sense, the form works without JS for cases where that matters.
- **Devtools** are good; they let you inspect form state, dirty fields, errors at runtime.
- **`setError`** for surfacing server errors back to specific fields. This is the bridge between backend RFC 7807 `errors.fields[]` and a usable UX (see `docs/13` for the test case).
- **Lightweight** — ~9 KB gz.

### Why zod

- **Schema-as-types**. `type Values = z.infer<typeof Schema>` means the type follows the schema. Renaming or adding a field updates both in one place.
- **Composable refinements**. Mirroring backend Pydantic rules: evidence ≥ 10 chars, sentence count ≤ 3, override delta ≤ ±5. All expressible as `.refine()` on the schema.
- **Server-error remapping is straightforward**. When backend returns `errors.fields = { evidenceNote: '...' }`, we call `setError('evidenceNote', { message: '...' })` — names match because schemas match.
- **One library for runtime + types**. We don't have separate validation libs for forms, for env vars, for API client error parsing — `packages/utils/env.ts` uses zod for env validation too.

### Why explicitly not Formik

Formik is fine; it's not what we want:

- **Controlled-by-default**. Every keystroke re-renders the whole form unless you carefully memoize subtrees. With 30-question intake, this is a real performance issue we'd fight.
- **Yup is the default schema lib**. Yup is fine but doesn't carry types like zod does; we'd add zod anyway, then have two systems.
- **`<Field />` + `<ErrorMessage />` components** are heavier than RHF's `register` pattern.
- **Maintenance trajectory**. Formik has slowed; RHF has continued to release.

### Why not native HTML validation alone

Native `<input required minlength="10">` works for the simple cases but breaks down for:

- Sentence counting (custom rule)
- Cross-field validation (password = confirmPassword)
- Server-error surfacing
- Conditional required (varies by persona in intake)

We'd fall back to JS anyway; better to start with the right library.

### Why no other validation libraries

| Library | Why not picked |
|---|---|
| **Yup** | Used widely with Formik; less ergonomic typing than zod |
| **Joi** | Server-side flavor; bundle weight; types weaker than zod |
| **Superstruct** | Smaller than zod; less popular; we picked zod for ecosystem |
| **valibot** | New, very lightweight; not yet stable enough to bet on at MVP scale |
| **io-ts** | Functional flavor; the team isn't on it |

## Pattern this enforces

Every form file looks the same shape:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const Schema = z.object({ /* ... */ })
type Values = z.infer<typeof Schema>

export function ThisForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } =
    useForm<Values>({ resolver: zodResolver(Schema) })

  const onSubmit = async (v: Values) => {
    try { await mutation.mutateAsync(v) }
    catch (e: any) {
      if (e.extras?.fields) for (const [n, m] of Object.entries(e.extras.fields))
        setError(n as keyof Values, { message: m as string })
    }
  }
  return <form onSubmit={handleSubmit(onSubmit)}>{ /* ... */ }</form>
}
```

This shape is recognisable in every form file across both apps. A new contributor adding a form copies this and fills it in.

## Schema mirroring (backend ↔ frontend)

Where forms POST to backend endpoints with corresponding Pydantic schemas, the zod schema mirrors the rule set:

| Backend Pydantic | Frontend zod | Shared rules |
|---|---|---|
| `OverrideRequest` | `OverrideSchema` | `evidenceNote: min 10`, `newRaw: ge 0 le max` |
| `InsightRequest` | `InsightSchema` | `text: min 30`, `sentence_count ≤ 3` |
| `DowngradeRequest` | `DowngradeSchema` | `evidenceNote: min 10`, `newRawValue: ge 0` |
| `RegisterRequest` | `RegisterSchema` | password complexity, terms checkbox |

These are documented next to each form. When the backend Pydantic rule changes, the frontend zod schema must change to match (a search for `evidenceNote.*min` finds both).

A test in each form file's `__tests__` exercises both client-side rejection (validation triggers) and server-side error mapping (`setError` lands on the right field).

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **Formik + Yup** | Re-render perf + schema-type drift |
| **React Final Form** | Smaller community; team unfamiliarity |
| **Uncontrolled `<form>` + manual validation** | Re-implements the easy half of RHF poorly |
| **Conform (Remix-style server-validated forms)** | Designed around SSR; our SPA model doesn't fit |
| **`useFormStatus` + React 19 actions** | Future-looking; not stable on React 18; revisit when we upgrade |

## Consequences

### Positive

- One pattern for every form across both apps.
- Schema → types alignment eliminates an entire class of bug.
- Server errors land on the right field automatically when names match.
- Forms perform well — the intake form's 30 inputs feel snappy.

### Negative

- `register('field')` spreads onto an `<input>` — slightly more arcane than `<input value={...} onChange={...}>`. Mitigation: this pattern is so consistent it becomes muscle memory after one form.
- Custom controls (date picker, file upload, multi-step) require `Controller` from RHF instead of `register`. Slightly more code but well-trodden.
- Conditional fields (e.g., "show field B only if field A is X") require `watch` + manual logic. Reasonable; no library makes this dramatically simpler.

## When to revisit

- React 19's `<form action>` + `useFormStatus` is promising; once we move to React 19 + the surrounding ecosystem catches up, evaluate whether RHF still earns its place.
- If we ever do server-rendered forms (we don't plan to — ADR-001), revisit with Remix-style tooling.

## Follow-ups

- `docs/07-forms-and-validation.md` is the practical guide; this ADR is the rationale.
- Phase 2: add a custom ESLint rule blocking `useState` for ≥ 2 controlled field values, to make the pattern de facto enforced rather than convention.
