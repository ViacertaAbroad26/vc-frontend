import type { AuditAction } from "@viacerta/api-client";

import { journeyStateLabel } from "./journey-state-labels";

export const AUDIT_ACTIONS: AuditAction[] = [
  "STATE_TRANSITION",
  "GCSS_OVERRIDE",
  "GCRI_OVERRIDE",
  "ASSESSMENT_CONFIRMED",
  "DOCUMENT_VERIFIED",
  "DOCUMENT_REJECTED",
  "REPORT_PUBLISHED",
  "RUBRIC_VERSION_PUBLISHED",
  "MATRIX_VERSION_PUBLISHED",
  "USER_ROLE_CHANGED",
  "CONSENT_GRANTED",
  "CONSENT_REVOKED",
  "DATA_EXPORT_REQUESTED",
  "DATA_DELETION_REQUESTED",
  "SLA_BREACHED",
];

export function auditActionLabel(action: string): string {
  return action
    .split("_")
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(" ");
}

/** Human-friendly description for an audit entry, e.g. "State transition: Report ready · awaiting Session 2 → Session 2 done". */
export function auditEntryDescription(entry: Record<string, unknown>): string {
  const action = entry["action"];
  const label = typeof action === "string" ? auditActionLabel(action) : "Activity";

  if (action === "STATE_TRANSITION") {
    const before = entry["before"];
    const after = entry["after"];
    const from = before && typeof before === "object" ? (before as Record<string, unknown>)["state"] : undefined;
    const to = after && typeof after === "object" ? (after as Record<string, unknown>)["state"] : undefined;
    if (typeof from === "string" && typeof to === "string") {
      return `${label}: ${journeyStateLabel(from)} → ${journeyStateLabel(to)}`;
    }
  }

  return label;
}
