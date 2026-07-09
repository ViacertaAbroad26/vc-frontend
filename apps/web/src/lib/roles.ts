/** Role groups used to gate advisor + internal-ops routes and nav items. */
export const ADVISOR_ROLES = ["ADVISOR", "SENIOR_ADVISOR"] as const;
export const SENIOR_ROLES = ["SENIOR_ADVISOR", "ADMIN"] as const;
export const COORD_ROLES = ["COORDINATOR", "ADMIN"] as const;
export const DOCS_OPS_ROLES = ["APPS_OPS", "VISA_OPS", "ADMIN"] as const;
export const DATA_OPS_ROLES = ["DATA_OPS", "SENIOR_ADVISOR", "ADMIN"] as const;
export const CAREER_ROLES = ["CAREER_SERVICES", "ADMIN"] as const;
export const ADMIN_ONLY = ["ADMIN"] as const;
export const STUDENT_ROLES = ["STUDENT"] as const;

/** Branch/organization management — global, so restricted to SUPER_ADMIN
 *  (a branch-scoped ADMIN should not see or edit other branches). */
export const SUPER_ADMIN_ONLY = ["SUPER_ADMIN"] as const;
