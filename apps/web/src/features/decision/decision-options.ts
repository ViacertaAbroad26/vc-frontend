export const DECISION_VALUES = ["ENROLL", "SELF_PREP", "WITHDRAW"] as const;

export type DecisionValue = (typeof DECISION_VALUES)[number];

export const DECISION_OPTIONS: { value: DecisionValue; title: string; blurb: string }[] = [
  {
    value: "ENROLL",
    title: "Enrol for full-service support",
    blurb: "We guide you end-to-end through country mapping, applications, visa and pre-departure.",
  },
  {
    value: "SELF_PREP",
    title: "Prepare on your own",
    blurb: "Use the report as your roadmap and come back when you're ready.",
  },
  {
    value: "WITHDRAW",
    title: "Step back from studying abroad",
    blurb: "The report suggests a different path makes sense right now.",
  },
];

/** Journey states the backend moves a student into once a decision has been recorded. */
export const DECISION_OPTION_BY_JOURNEY_STATE: Record<string, DecisionValue> = {
  ENROLLED: "ENROLL",
  SELF_PREP: "SELF_PREP",
  DECLINED: "WITHDRAW",
};

/** Journey states that exist before the decision gate is reached. */
const PRE_DECISION_STATES = new Set<string>([
  "LEAD",
  "INTAKE_SENT",
  "INTAKE_COMPLETE",
  "AI_PRESCORED",
  "SESSION1_BOOKED",
  "GCSS_CONFIRMED",
  "GAP_LOOP",
  "GCRI_RUN",
  "REPORT_BUILT",
  "SESSION2_DONE",
  "DECISION_GATE",
]);

/**
 * Once a student enrols, the journey moves on to later stages (country mapping,
 * applications, etc.) so `currentState` is no longer `ENROLLED`. Any state past
 * the decision gate that isn't SELF_PREP/DECLINED means the student chose ENROLL.
 */
export function decisionForJourneyState(currentState: string): DecisionValue | null {
  if (currentState in DECISION_OPTION_BY_JOURNEY_STATE) {
    return DECISION_OPTION_BY_JOURNEY_STATE[currentState];
  }
  return PRE_DECISION_STATES.has(currentState) ? null : "ENROLL";
}
