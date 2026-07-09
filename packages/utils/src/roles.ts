import type { AppRole } from "./types";

/** Human-readable label for a role, e.g. "SENIOR_ADVISOR" -> "Senior Advisor". */
export function roleLabel(role: string): string {
  return role
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Broad categories used to group users/staff in admin tables. */
export type RoleCategory = "Students & Parents" | "Advisory" | "Coordination & Ops" | "Administration";

const CATEGORY_BY_ROLE: Record<AppRole, RoleCategory> = {
  STUDENT: "Students & Parents",
  PARENT: "Students & Parents",
  ADVISOR: "Advisory",
  SENIOR_ADVISOR: "Advisory",
  COORDINATOR: "Coordination & Ops",
  APPS_OPS: "Coordination & Ops",
  VISA_OPS: "Coordination & Ops",
  CAREER_SERVICES: "Coordination & Ops",
  DATA_OPS: "Coordination & Ops",
  ADMIN: "Administration",
  SUPER_ADMIN: "Administration",
};

export function roleCategory(role: AppRole): RoleCategory {
  return CATEGORY_BY_ROLE[role];
}

export const ROLE_CATEGORY_ORDER: RoleCategory[] = [
  "Administration",
  "Advisory",
  "Coordination & Ops",
  "Students & Parents",
];
