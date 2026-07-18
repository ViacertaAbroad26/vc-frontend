import type { JourneyStateCode } from "@viacerta/api-client";

export const STAGE_TIMELINE: { stage: number; label: string }[] = [
  { stage: 1, label: "Assessment" },
  { stage: 2, label: "Country mapping" },
  { stage: 3, label: "University selection" },
  { stage: 4, label: "Document prep" },
  { stage: 5, label: "Applications & visa" },
  { stage: 6, label: "Pre-departure" },
  { stage: 7, label: "Placement" },
  { stage: 8, label: "Completed" },
];

const STAGE_BY_STATE: Record<JourneyStateCode, number> = {
  LEAD: 1,
  INTAKE_SENT: 1,
  INTAKE_COMPLETE: 1,
  AI_PRESCORED: 1,
  SESSION1_BOOKED: 1,
  GCSS_CONFIRMED: 1,
  GAP_LOOP: 1,
  GCRI_RUN: 1,
  REPORT_BUILT: 1,
  SESSION2_DONE: 1,
  DECISION_GATE: 1,
  ENROLLED: 1,
  SELF_PREP: 1,
  DECLINED: 1,
  STAGE2_COUNTRY_MAPPING: 2,
  STAGE3_UNIVERSITY_SELECTION: 3,
  STAGE4_DOCUMENT_PREP: 4,
  STAGE5_APPLICATIONS: 5,
  STAGE5_VISA: 5,
  STAGE6_PRE_DEPARTURE: 6,
  STAGE7_PLACEMENT: 7,
  COMPLETED: 8,
};

export function stageNumberForState(state: string): number {
  return STAGE_BY_STATE[state as JourneyStateCode] ?? 1;
}

/**
 * Display labels for the redesigned student journey UI (design system
 * VC-UX-2026-01). "Stage 0 · Discovery" is a pure-frontend orientation
 * step with no backend state — the numbered stages below map 1:1 onto the
 * backend's existing STAGE_TIMELINE (same state machine, renamed for the
 * student-facing presentation only; no backend semantics changed).
 */
export const JOURNEY_STAGE_LABELS: { stage: number; label: string; description: string }[] = [
  { stage: 0, label: "Discovery", description: "Orientation before assessment" },
  { stage: 1, label: "Global Career Assessment", description: "Understand the student, completely" },
  { stage: 2, label: "Career Strategy", description: "Define the ideal global career path" },
  { stage: 3, label: "University Strategy", description: "Choose universities strategically" },
  { stage: 4, label: "Application Execution", description: "Execute world-class applications" },
  { stage: 5, label: "Visa & Financial Planning", description: "Prepare financially and legally" },
  { stage: 6, label: "Pre-Departure", description: "Prepare for life abroad" },
  { stage: 7, label: "Global Career Success", description: "Secure the internship or job" },
];

/** Stage-2-7 (+ Completed) targets an advisor/coordinator can move a student into. */
export const ADVANCEABLE_STATES: { value: JourneyStateCode; label: string }[] = [
  { value: "STAGE2_COUNTRY_MAPPING", label: "Stage 2 · Country mapping" },
  { value: "STAGE3_UNIVERSITY_SELECTION", label: "Stage 3 · University selection" },
  { value: "STAGE4_DOCUMENT_PREP", label: "Stage 4 · Document prep" },
  { value: "STAGE5_APPLICATIONS", label: "Stage 5 · Applications" },
  { value: "STAGE5_VISA", label: "Stage 5 · Visa" },
  { value: "STAGE6_PRE_DEPARTURE", label: "Stage 6 · Pre-departure" },
  { value: "STAGE7_PLACEMENT", label: "Stage 7 · Placement" },
  { value: "COMPLETED", label: "Completed" },
];
