import { type AppRole, routes } from "@viacerta/utils";

/** Where to land a user right after login/register, based on their role. */
export function destinationByRole(role: AppRole, studentId?: string | null): string {
  switch (role) {
    case "SUPER_ADMIN":
      return routes.admin;
    case "STUDENT":
      return routes.dashboard;
    case "PARENT":
      return studentId ? routes.parent(studentId) : routes.dashboard;
    case "COORDINATOR":
      return routes.leads;
    case "DATA_OPS":
      return routes.dataOps;
    case "ADMIN":
      return routes.users;
    case "APPS_OPS":
    case "VISA_OPS":
      return routes.documentVerify;
    case "CAREER_SERVICES":
      return routes.outcomes;
    case "ADVISOR":
    case "SENIOR_ADVISOR":
    default:
      return routes.cases;
  }
}
