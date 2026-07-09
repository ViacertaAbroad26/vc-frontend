import type { BadgeProps } from "@viacerta/ui";

const LABELS: Record<string, string> = {
  OPEN: "Open",
  RESOLVED_KEPT: "Resolved · kept",
  RESOLVED_REASSESS: "Resolved · reassess",
};

export function disputeStatusLabel(status: string): string {
  return LABELS[status] ?? status;
}

export function disputeStatusVariant(status: string): NonNullable<BadgeProps["variant"]> {
  switch (status) {
    case "OPEN":
      return "amber";
    case "RESOLVED_KEPT":
      return "green";
    case "RESOLVED_REASSESS":
      return "navy";
    default:
      return "default";
  }
}
