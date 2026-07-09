import type { UserRole } from "@viacerta/api-client";

export const USER_ROLES = [
  "STUDENT",
  "PARENT",
  "ADVISOR",
  "SENIOR_ADVISOR",
  "COORDINATOR",
  "APPS_OPS",
  "VISA_OPS",
  "CAREER_SERVICES",
  "DATA_OPS",
  "ADMIN",
  "SUPER_ADMIN",
] as const satisfies readonly UserRole[];

/** Roles assignable via create-user / change-role, given the acting user's own role.
 *  Only a SUPER_ADMIN can grant or hold the SUPER_ADMIN role. */
export function assignableRoles(actingRole: string | undefined): readonly UserRole[] {
  return actingRole === "SUPER_ADMIN" ? USER_ROLES : USER_ROLES.filter((r) => r !== "SUPER_ADMIN");
}
