import type { ApiComponents } from "@viacerta/api-client";

type JourneyStateCode = ApiComponents["schemas"]["JourneyStateCode"];

export const JOURNEY_STATE_LABELS: Record<JourneyStateCode, string> = {
  LEAD: "Lead",
  INTAKE_SENT: "Intake sent",
  INTAKE_COMPLETE: "Intake complete",
  AI_PRESCORED: "Pre-scored · awaiting Session 1",
  SESSION1_BOOKED: "Session 1 booked",
  GCSS_CONFIRMED: "GCSS confirmed",
  GAP_LOOP: "Closing gaps",
  GCRI_RUN: "Running GCRI",
  REPORT_BUILT: "Report ready · awaiting Session 2",
  SESSION2_DONE: "Session 2 done",
  DECISION_GATE: "Decision gate",
  ENROLLED: "Enrolled",
  SELF_PREP: "Self-prep",
  DECLINED: "Declined",
  STAGE2_COUNTRY_MAPPING: "Stage 2 · country mapping",
  STAGE3_UNIVERSITY_SELECTION: "Stage 3 · university selection",
  STAGE4_DOCUMENT_PREP: "Stage 4 · document prep",
  STAGE5_APPLICATIONS: "Stage 5 · applications",
  STAGE5_VISA: "Stage 5 · visa",
  STAGE6_PRE_DEPARTURE: "Stage 6 · pre-departure",
  STAGE7_PLACEMENT: "Stage 7 · placement",
  COMPLETED: "Completed",
};

export function journeyStateLabel(code: string): string {
  return JOURNEY_STATE_LABELS[code as JourneyStateCode] ?? code;
}
