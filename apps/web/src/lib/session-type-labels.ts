import type { SessionType } from "@viacerta/api-client";

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  SESSION_1: "Session 1",
  SESSION_2: "Session 2",
  GAP_REVIEW: "Gap review",
  STAGE_2_COUNTRY_MAPPING: "Stage 2 · country mapping",
  OTHER: "Other",
};

export function sessionTypeLabel(type: string): string {
  return SESSION_TYPE_LABELS[type as SessionType] ?? type;
}
