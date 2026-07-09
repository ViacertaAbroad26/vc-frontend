/** Branded string types to avoid mixing up similarly-shaped IDs. */
declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };

/** ULID-format identifier (used for students, submissions, cases, etc). */
export type UlidString = Brand<string, "Ulid">;

/** ISO 3166-1 alpha-2 country code, e.g. "IN", "DE", "CA". */
export type Iso2 = Brand<string, "Iso2">;

/** ISO 8601 date-time string as returned by the backend. */
export type Iso8601 = Brand<string, "Iso8601">;

/** Common pagination envelope shape. */
export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

/** Roles for the student/parent-facing screens. */
export type PortalRole = "STUDENT" | "PARENT";

/** Roles for advisor + internal ops screens. */
export type AdvisorRole =
  | "ADVISOR"
  | "SENIOR_ADVISOR"
  | "COORDINATOR"
  | "APPS_OPS"
  | "VISA_OPS"
  | "CAREER_SERVICES"
  | "DATA_OPS"
  | "ADMIN"
  | "SUPER_ADMIN";

/** Every role the merged app's router and nav need to branch on. */
export type AppRole = PortalRole | AdvisorRole;

/** The authenticated user shape returned by `/api/v1/auth/me`. */
export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  studentId: string | null;
  /** Branch the user belongs to; `null` for HQ/global (e.g. SUPER_ADMIN). */
  orgId: string | null;
};
