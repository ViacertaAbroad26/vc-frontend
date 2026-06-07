# 00 — Frontend Context

## What we're building

Two React apps that surface the ViaCerta backend to three audiences. Both apps are SPAs built with Vite, consumed via the backend's two OpenAPI specs.

| App | Audiences | Hostname (prod) | Backend spec |
|---|---|---|---|
| Portal | Student + Parent | `app.viacerta.com` | `/openapi.json` |
| Advisor | Advisor + Senior + Coordinator + Ops + Admin | `console.viacerta.com` | `/advisor/openapi.json` |

The split exists for **audience separation**. The portal app's TypeScript types are generated from the portal-only OpenAPI spec — advisor-only fields literally don't exist in the portal codebase.

## What the portal does

1. Student registers, selects persona (school / final-year UG / working pro).
2. Fills out a persona-routed intake form (save-and-resume across sessions).
3. Uploads required documents.
4. Sees "AI is pre-scoring your responses" while the backend job runs.
5. Books Session 1.
6. After advisor confirms the score, sees a published, audience-filtered report:
   - GCSS dimension breakdown (no weights, no override metadata, no version IDs)
   - GCRI per chosen country (cards + heat map)
   - Advisor's 6 insight blocks
   - 90-day plan + risk register + ROI summary
   - Parent-summary side card
7. Records a decision at the gate (Enroll / Self-Prep / Withdraw).
8. Optional: parent registers separately, requests link to a student, student approves → parent sees parent-summary only.

## What the advisor app does

1. Advisor logs in → sees case queue filtered by state + flag.
2. Clicks a case → student detail with intake answers, documents (with evidence level), AI pre-score, audit summary.
3. Conducts Session 1, applies overrides via an evidence-required modal.
4. Confirms the assessment → state advances based on flag (GREEN→GCRI_RUN, YELLOW→GAP_LOOP, RED/DECLINED→terminal).
5. Triggers GCRI for chosen countries (server blocks if `gcssFinal < 60`).
6. Reviews per-country; optionally applies ±5 override with evidence.
7. Opens report builder → writes 3-sentence insight per section (validation enforced).
8. Publishes report → triggers PDF render job.
9. Records Session 2; transitions to decision gate.

Internal ops surfaces inside the same app, gated by role:

- **Coordinators**: leads queue, assign advisors.
- **Apps/Visa Ops**: document verify/reject.
- **Senior Advisor / Data Ops**: rubric + matrix publish/activate, hard-coded downgrades, freshness dashboard.
- **Career Services**: Year-1 / Year-3 outcome capture.
- **Admin**: user management.

## Trust posture

- Every score view says "predicts probability, not certainty" via `<ReportDisclaimer />`.
- Every override the advisor makes requires an evidence note ≥ 10 characters; the input cannot submit otherwise.
- The portal never shows weights, override deltas, version IDs, or `confidenceMultiplier`. Not because the UI hides them — because the **types don't exist** in the portal client.
- Parent view is more restricted still: only `parentSummary` + headline score + flag.

## What this means for the frontend

- This is not a marketing site. It's a decision-support workflow tool.
- Loading states matter (AI pre-score can take 30–60s).
- Form ergonomics matter (intake is the longest workflow; save-and-resume is mandatory).
- Visual hierarchy matters (the GCSS flag is the headline; sub-component details are progressive disclosure).
- Mobile is supported but not the primary target — most students fill intake on a laptop; advisors live on the desktop console.

## Out of scope (MVP)

- Marketing pages (separate site)
- Payments (Phase 2)
- Native mobile apps
- Real-time anything — polling for AI pre-score status is fine
- Internationalization — English only at MVP, structure supports i18n later via `react-i18next` add-on
