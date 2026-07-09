# 05 — Auth & Routing

> JWT in memory + localStorage. React Router v6 with one router and role-based guards. One app, one combined role set (`AppRole`).

## Token lifecycle

1. **Register / Login** → backend returns `{ accessToken, refreshToken, user }`. Store both in localStorage via `authStorage` (`docs/04-api-client.md`). Store `user` in the Zustand `auth-store`.
2. **Every API call** → `axios` request interceptor attaches `Authorization: Bearer <accessToken>`.
3. **401 from API** → response interceptor calls `/auth/refresh` once, rotates tokens, retries the original request.
4. **Refresh fails** → `authStorage.clear()`, dispatch `viacerta:session-expired` event. The app listens and redirects to `/login`.
5. **Logout** → POST `/auth/logout` with the refresh token, then `authStorage.clear()`, route to `/login`.

`authStorage` (`packages/api-client/src/auth-storage.ts`) uses a single namespace — `viacerta:access` / `viacerta:refresh` localStorage keys — for the whole app. There's no per-audience prefix: whichever role logs in (student, parent, advisor, ops, admin), the same two keys hold its tokens. The refresh interceptor (`packages/api-client/src/refresh-interceptor.ts`) is a single shared instance wired into `apiAxios`.

## Single role union — `AppRole`

```ts
// packages/utils/src/types.ts
export type PortalRole = "STUDENT" | "PARENT";

export type AdvisorRole =
  | "ADVISOR" | "SENIOR_ADVISOR" | "COORDINATOR"
  | "APPS_OPS" | "VISA_OPS" | "CAREER_SERVICES"
  | "DATA_OPS" | "ADMIN" | "SUPER_ADMIN";

/** Every role the merged app's router and nav need to branch on. */
export type AppRole = PortalRole | AdvisorRole;

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  studentId: string | null;
  /** Branch the user belongs to; `null` for HQ/global (e.g. SUPER_ADMIN). */
  orgId: string | null;
};
```

`PortalRole` and `AdvisorRole` still exist as the two halves of the union (handy when a function only makes sense for one half), but every `AuthUser.role` and every place a role is checked at runtime is typed as `AppRole`. There's no separate "advisor app's `AuthUser`" — one shape covers everyone.

`SUPER_ADMIN` is a platform-level "god mode" role (Phase 4 — see `15-development-roadmap.md`): `<RoleGate>` lets it through regardless of `allow`, and `<SideNav>` shows it every nav item. `orgId` is the user's branch (`null` = HQ/global, which is always true for `SUPER_ADMIN`); branch-scoped list/report endpoints are filtered server-side by `orgId`, so the frontend never re-filters by branch itself.

## Zustand auth store

One store, `apps/web/src/stores/auth-store.ts`, used by every role:

```ts
// apps/web/src/stores/auth-store.ts
import { authStorage } from "@viacerta/api-client";
import type { AuthUser } from "@viacerta/utils";
import { create } from "zustand";

export type { AuthUser };

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (u: AuthUser | null) => void;
  setLoading: (b: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    authStorage.clear();
    set({ user: null });
  },
}));
```

`user.role` is `AppRole`, so `<RoleGate>`, `<SideNav>`, and `destinationByRole()` all branch on the same field regardless of whether the logged-in user is a student or an admin.

## Boot — hydrating session

```tsx
// apps/web/src/App.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { apiAxios, type AuthUser } from "@viacerta/api-client";
import { Toaster, toast } from "@viacerta/ui";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";

import { queryClient } from "@/lib/query-client";
import { router } from "@/router";
import { useAuthStore } from "@/stores/auth-store";

export function App() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await apiAxios.get<AuthUser>("/api/v1/auth/me");
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [setUser, setLoading]);

  // Listen for session-expired from the shared refresh interceptor
  useEffect(() => {
    const onExpired = () => {
      toast.warning("Your session expired. Please sign in again.");
      useAuthStore.getState().logout();
      window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    };
    window.addEventListener("viacerta:session-expired", onExpired);
    return () => window.removeEventListener("viacerta:session-expired", onExpired);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
```

`/api/v1/auth/me` works for any authenticated role — the backend returns whichever `AuthUser` shape matches the JWT's role, and the frontend doesn't need to know in advance which kind of user it's hydrating.

## One router, role-based gating

There is a single `createBrowserRouter` instance, `apps/web/src/router.tsx`, covering the entire app — student/parent routes, advisor routes, and internal-ops routes all live in one route tree. There is no separate portal router or advisor router, no separate dev server, and no separate build.

Two guard components compose to enforce access:

- **`<ProtectedRoute>`** (`apps/web/src/components/shared/ProtectedRoute.tsx`) wraps the entire authenticated route subtree. It checks for a logged-in user and redirects to `/login` if there isn't one. Every route except `/login` and `/register` sits behind this.
- **`<RoleGate allow={...}>`** (`apps/web/src/components/shared/RoleGate.tsx`) additionally wraps individual advisor and internal-ops routes. If the current user's role isn't in the `allow` list, it redirects to `/forbidden`.

### ProtectedRoute

```tsx
// apps/web/src/components/shared/ProtectedRoute.tsx
import { Spinner } from "@viacerta/ui";
import { type PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "@/stores/auth-store";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}
```

### RoleGate

```tsx
// apps/web/src/components/shared/RoleGate.tsx
import { type PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

import { useAuthStore } from "@/stores/auth-store";

export function RoleGate({
  allow, children,
}: PropsWithChildren<{ allow: ReadonlyArray<string> }>) {
  const user = useAuthStore((s) => s.user);
  // SUPER_ADMIN is god-mode: it satisfies every role-gated route.
  if (!user || (user.role !== "SUPER_ADMIN" && !allow.includes(user.role))) {
    return <Navigate to="/forbidden" replace />;
  }
  return <>{children}</>;
}
```

### Role-group constants — `apps/web/src/lib/roles.ts`

`<RoleGate>` and `<SideNav>` both consume the same role-group constants, so a route's access and its nav visibility never drift apart:

```ts
// apps/web/src/lib/roles.ts
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
```

## The router — `apps/web/src/router.tsx`

```tsx
import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { RoleGate } from "@/components/shared/RoleGate";
import {
  ADMIN_ONLY,
  ADVISOR_ROLES,
  CAREER_ROLES,
  COORD_ROLES,
  DATA_OPS_ROLES,
  DOCS_OPS_ROLES,
  SENIOR_ROLES,
  SUPER_ADMIN_ONLY,
} from "@/lib/roles";
import ForbiddenPage from "@/routes/ForbiddenPage";
import HomePage from "@/routes/HomePage";
import NotFoundPage from "@/routes/NotFoundPage";

// auth
import LoginPage from "@/routes/auth/LoginPage";
import RegisterPage from "@/routes/auth/RegisterPage";

// student
import JourneyPage from "@/routes/student/JourneyPage";
import IntakeStartPage from "@/routes/student/IntakeStartPage";
import IntakeFormPage from "@/routes/student/IntakeFormPage";
import DocumentsPage from "@/routes/student/DocumentsPage";
import PendingPage from "@/routes/student/PendingPage";
import ReportPage from "@/routes/student/ReportPage";
import DecisionGatePage from "@/routes/student/DecisionGatePage";

// parent
import ParentSummaryPage from "@/routes/parent/ParentSummaryPage";

// advisor
import CaseQueuePage from "@/routes/advisor/CaseQueuePage";
import StudentDetailPage from "@/routes/advisor/StudentDetailPage";
import AssessmentPage from "@/routes/advisor/AssessmentPage";
import GcriPage from "@/routes/advisor/GcriPage";
import ReportBuilderPage from "@/routes/advisor/ReportBuilderPage";
import CalibrationPage from "@/routes/advisor/CalibrationPage";

// internal ops
import LeadsPage from "@/routes/internal/LeadsPage";
import DocumentVerifyPage from "@/routes/internal/DocumentVerifyPage";
import DataOpsPage from "@/routes/internal/DataOpsPage";
import OutcomesPage from "@/routes/internal/OutcomesPage";
import UsersPage from "@/routes/internal/UsersPage";
import OrganizationsPage from "@/routes/internal/OrganizationsPage";

export const router = createBrowserRouter([
  // Public
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  // Authenticated — single subtree for every role
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <HomePage /> },

      // Student
      { path: "/journey", element: <JourneyPage /> },
      { path: "/intake", element: <IntakeStartPage /> },
      { path: "/intake/:submissionId", element: <IntakeFormPage /> },
      { path: "/documents", element: <DocumentsPage /> },
      { path: "/pending", element: <PendingPage /> },
      { path: "/report", element: <ReportPage /> },
      { path: "/decision", element: <DecisionGatePage /> },

      // Parent
      { path: "/parent/students/:studentId", element: <ParentSummaryPage /> },

      // Advisor
      { path: "/cases",
        element: <RoleGate allow={ADVISOR_ROLES}><CaseQueuePage /></RoleGate> },
      { path: "/students/:studentId",
        element: <RoleGate allow={ADVISOR_ROLES}><StudentDetailPage /></RoleGate> },
      { path: "/students/:studentId/assessment",
        element: <RoleGate allow={ADVISOR_ROLES}><AssessmentPage /></RoleGate> },
      { path: "/students/:studentId/gcri",
        element: <RoleGate allow={ADVISOR_ROLES}><GcriPage /></RoleGate> },
      { path: "/students/:studentId/report",
        element: <RoleGate allow={ADVISOR_ROLES}><ReportBuilderPage /></RoleGate> },
      { path: "/calibration",
        element: <RoleGate allow={[...SENIOR_ROLES, ...ADVISOR_ROLES]}><CalibrationPage /></RoleGate> },

      // Internal ops
      { path: "/leads",
        element: <RoleGate allow={COORD_ROLES}><LeadsPage /></RoleGate> },
      { path: "/document-verify",
        element: <RoleGate allow={DOCS_OPS_ROLES}><DocumentVerifyPage /></RoleGate> },
      { path: "/data-ops",
        element: <RoleGate allow={DATA_OPS_ROLES}><DataOpsPage /></RoleGate> },
      { path: "/outcomes",
        element: <RoleGate allow={CAREER_ROLES}><OutcomesPage /></RoleGate> },
      { path: "/users",
        element: <RoleGate allow={ADMIN_ONLY}><UsersPage /></RoleGate> },
      { path: "/organizations",
        element: <RoleGate allow={SUPER_ADMIN_ONLY}><OrganizationsPage /></RoleGate> },

      { path: "/forbidden", element: <ForbiddenPage /> },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);
```

A logged-in advisor and a logged-in student hit the exact same `<ProtectedRoute><AppShell /></ProtectedRoute>` subtree. What differs is which routes their `<SideNav>` shows them, and which routes a `<RoleGate>` will let them actually render — see below.

## HomePage — role-based landing

`/` always renders `<HomePage>` (`apps/web/src/routes/HomePage.tsx`), which is the single landing point for every role:

```tsx
// apps/web/src/routes/HomePage.tsx
import { Navigate } from "react-router-dom";

import { destinationByRole } from "@/lib/destination-by-role";
import DashboardPage from "@/routes/student/DashboardPage";
import { useAuthStore } from "@/stores/auth-store";

/** Landing route ("/"): students see the dashboard, everyone else is redirected by role. */
export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  if (!user || user.role === "STUDENT") {
    return <DashboardPage />;
  }
  return <Navigate to={destinationByRole(user.role, user.studentId)} replace />;
}
```

`destinationByRole()` (`apps/web/src/lib/destination-by-role.ts`) centralizes the role → landing-route mapping:

```ts
// apps/web/src/lib/destination-by-role.ts
import { type AppRole, routes } from "@viacerta/utils";

export function destinationByRole(role: AppRole, studentId?: string | null): string {
  switch (role) {
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
```

So: a parent landing on `/` is bounced to their student's summary page, an advisor to `/cases`, a coordinator to `/leads`, an admin to `/users`, and so on. A student (or anyone unauthenticated who somehow reaches this — `<ProtectedRoute>` would have already redirected them) just sees the dashboard directly.

## SideNav — role-filtered navigation

`<SideNav>` (`apps/web/src/components/layout/SideNav.tsx`) renders one flat list of nav items, each tagged with the role group allowed to see it, and filters by the current user's role:

```tsx
// apps/web/src/components/layout/SideNav.tsx (excerpt)
import { routes } from "@viacerta/utils";
import {
  ADMIN_ONLY, ADVISOR_ROLES, CAREER_ROLES, COORD_ROLES,
  DATA_OPS_ROLES, DOCS_OPS_ROLES, SENIOR_ROLES, STUDENT_ROLES,
  SUPER_ADMIN_ONLY,
} from "@/lib/roles";
import { useAuthStore } from "@/stores/auth-store";

const NAV_ITEMS = [
  { to: routes.dashboard, label: "Dashboard", allow: STUDENT_ROLES },
  { to: routes.journey, label: "Journey", allow: STUDENT_ROLES },
  { to: routes.intakeStart, label: "Intake", allow: STUDENT_ROLES },
  { to: routes.documents, label: "Documents", allow: STUDENT_ROLES },
  { to: routes.report, label: "Report", allow: STUDENT_ROLES },
  { to: routes.decision, label: "Decision", allow: STUDENT_ROLES },

  { to: routes.cases, label: "Case queue", allow: ADVISOR_ROLES },
  { to: routes.calibration, label: "Calibration", allow: [...SENIOR_ROLES, ...ADVISOR_ROLES] },

  { to: routes.leads, label: "Leads", allow: COORD_ROLES },
  { to: routes.documentVerify, label: "Document verify", allow: DOCS_OPS_ROLES },
  { to: routes.dataOps, label: "Data ops", allow: DATA_OPS_ROLES },
  { to: routes.outcomes, label: "Outcomes", allow: CAREER_ROLES },
  { to: routes.users, label: "Users", allow: ADMIN_ONLY },
  { to: routes.organizations, label: "Branches", allow: SUPER_ADMIN_ONLY },
] as const;

export function SideNav() {
  const user = useAuthStore((s) => s.user);
  // SUPER_ADMIN bypasses the `allow` filter entirely and sees every item.
  // ...filter the rest of NAV_ITEMS down to those whose `allow` includes user.role, then render <NavLink>s
}
```

A student never sees "Case queue" or "Users" in the sidebar; an advisor never sees "Intake" or "Decision". This is purely a UX nicety — see "The real boundary" below.

## Login and registration — single pages for every role

There is one `LoginPage` (`apps/web/src/routes/auth/LoginPage.tsx`) and one `RegisterPage`, used by students, parents, advisors, and internal-ops users alike. The login form posts to `/api/v1/auth/login`, which works for any role; the response's `user.role` (`AppRole`) determines what happens next.

### Public registration only offers Student / Parent

`RegisterForm.tsx`'s role picker ("I am a...") intentionally only lists **Student** and **Parent**:

```ts
// apps/web/src/features/auth/RegisterForm.tsx
const RegisterSchema = z.object({
  // ...
  role: z.enum(["STUDENT", "PARENT"]),
});
```

This is by design, not an oversight:

- **`POST /api/v1/auth/register` accepts the full `UserRole` enum** but rejects `role: "ADMIN"` and `role: "SUPER_ADMIN"` with `422` (`be-viacerta/app/services/auth_service.py`). Even without that backend check, letting an anonymous visitor self-register as `ADVISOR`/`COORDINATOR`/etc. via the public page would be an access-control bug — staff roles must be provisioned by someone already trusted.
- **Every non-portal role (`ADVISOR`, `SENIOR_ADVISOR`, `COORDINATOR`, `APPS_OPS`, `VISA_OPS`, `CAREER_SERVICES`, `DATA_OPS`, `ADMIN`, `SUPER_ADMIN`) is created via the internal "Create user" form** on `/users` (`apps/web/src/features/users/CreateUserForm.tsx`), which is itself `ADMIN_ONLY`-gated (`<RoleGate allow={ADMIN_ONLY}>`).
- **`SUPER_ADMIN` is further restricted**: `assignableRoles(actingRole)` (`apps/web/src/features/users/roles.ts`) only includes `SUPER_ADMIN` in the create-user/change-role dropdowns when the *acting* user is already `SUPER_ADMIN` — granting it via `/internal/users` otherwise returns `403`, handled with a friendly message in `CreateUserForm` / `UserDirectory`.
- **Locally previewing a staff role without creating an account**: the dev-only `DevRoleSwitcher` on `LoginPage` (`import.meta.env.DEV` only) lets a developer set an `X-Dev-Role`/`X-Dev-Org` override that the backend honors when `AUTH_OPTIONAL=true` and no JWT is present — see `15-development-roadmap.md` Phase 4.

So: a real Student/Parent self-registers here; everyone else (advisors, ops, admins, the seeded `superadmin@viacerta.dev`) gets an account from an Admin/SUPER_ADMIN via `/users`, or is previewed locally via the dev role switcher.

```tsx
// apps/web/src/features/auth/useLogin.ts
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { apiAxios, authStorage } from "@viacerta/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { destinationByRole } from "@/lib/destination-by-role";

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      const { data } = await apiAxios.post("/api/v1/auth/login", body);
      return data;
    },
    onSuccess: (resp) => {
      authStorage.setTokens(resp.tokens);
      setUser(resp.user);
      const from = (location.state as any)?.from
        ?? destinationByRole(resp.user.role, resp.user.studentId);
      navigate(from, { replace: true });
    },
  });
}
```

If the user arrived at `/login` via a redirect from `<ProtectedRoute>` (e.g. they hit a deep link while logged out), `location.state.from` sends them back to where they were. Otherwise `destinationByRole()` picks the right landing page for their role — the same function `<HomePage>` uses.

## Named routes — `@viacerta/utils/routes.ts`

```ts
// packages/utils/src/routes.ts
export const routes = {
  login: "/login",
  register: "/register",

  // Student / parent
  dashboard: "/",
  journey: "/journey",
  intakeStart: "/intake",
  intakeForm: (id: string) => `/intake/${id}`,
  documents: "/documents",
  pending: "/pending",
  report: "/report",
  decision: "/decision",
  parent: (studentId: string) => `/parent/students/${studentId}`,

  // Advisor
  cases: "/cases",
  studentDetail: (id: string) => `/students/${id}`,
  assessment: (id: string) => `/students/${id}/assessment`,
  gcri: (id: string) => `/students/${id}/gcri`,
  reportBuilder: (id: string) => `/students/${id}/report`,
  calibration: "/calibration",

  // Internal ops
  leads: "/leads",
  documentVerify: "/document-verify",
  dataOps: "/data-ops",
  outcomes: "/outcomes",
  users: "/users",
  organizations: "/organizations",

  forbidden: "/forbidden",
} as const;
```

One `routes` object, imported by any feature regardless of audience — `destinationByRole`, `<SideNav>`, `<RoleGate>` redirects, and individual features (e.g. a "View case" link from an advisor screen to `routes.studentDetail(id)`) all use it. There's no "portal routes vs. advisor routes" split and no ESLint rule preventing one audience's code from importing the other's route constants — the route names themselves are part of one shared map.

## The real boundary: backend authorization, not the frontend bundle

This is the load-bearing fact about auth in the merged app (see [ADR-007](./ADR-007-single-app-merge.md) for the full rationale):

- **`<ProtectedRoute>` and `<RoleGate>` are runtime UX, not a security control.** They stop a logged-in student from *seeing* the advisor case queue UI and stop an unauthenticated visitor from seeing any authenticated screen. That's it.
- **The backend is the actual security boundary.** A STUDENT's JWT is rejected by `/api/v1/advisor/*` and `/api/v1/internal/*` endpoints regardless of what routes exist in the frontend bundle, what `<RoleGate allow={...}>` says, or whether a `<RoleGate>` was forgotten on a new route entirely. The backend's two OpenAPI specs (`/openapi.json`, `/advisor/openapi.json`) define which roles can call which endpoints, and that's enforced server-side independent of the frontend.
- **Practical consequence**: forgetting to wrap a new advisor/internal route in `<RoleGate allow={...}>` is a real bug — a student could navigate to it and see the page shell render — but it is not a data-leak bug as long as the backend correctly rejects the student's token on every API call that page makes. Code review should still catch missing `<RoleGate>`s (there's no build-level backstop anymore — see ADR-007), but the severity is "bad UX / confusing 403s in the UI", not "student saw another student's GCSS internals".
- One more thing this implies: because `@viacerta/api-client` exports types for *all* endpoints from one merged `api.d.ts`, any feature can technically `import type { AdvisorAssessmentResponse } from "@viacerta/api-client"` even from a student-facing file. Nothing stops this at the type level. The thing that matters is still: which **routes** (gated by `<RoleGate>`) and which **API calls** (gated by the backend) a given role can actually reach.

## Session-expired UX

When the refresh interceptor fails (refresh-token expired, revoked, or reuse-detected), the app:

1. Clears local state via `authStorage.clear()` and `useAuthStore.getState().logout()`.
2. Shows a toast: "Your session expired. Please sign in again."
3. Navigates to `/login` with a `next` query param set to the current path so the user lands back where they were after re-auth.

This is the same flow shown in "Boot — hydrating session" above (`apps/web/src/App.tsx`), and it applies identically no matter which role's session expired.

## Forbidden / 404 pages

`/forbidden` (`apps/web/src/routes/ForbiddenPage.tsx`) is what `<RoleGate>` redirects to when a logged-in user's role isn't in `allow`. `*` (`apps/web/src/routes/NotFoundPage.tsx`) is the catch-all for unknown paths:

```tsx
// apps/web/src/routes/NotFoundPage.tsx
import { Link } from "react-router-dom";
import { Button } from "@viacerta/ui";

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold text-gray-900">Page not found</h1>
      <p className="max-w-md text-gray-600">
        The page you're looking for doesn't exist or was moved.
      </p>
      <Button asChild variant="primary">
        <Link to="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
```

`<Link to="/">` works for every role here too — it lands on `<HomePage>`, which redirects appropriately via `destinationByRole()`.

## Lazy loading (optional, recommended)

Routes can be lazy-loaded to reduce initial bundle. Use `React.lazy` + `Suspense`:

```tsx
import { lazy, Suspense } from "react";
const ReportPage = lazy(() => import("@/routes/student/ReportPage"));

{ path: "/report", element: (
  <Suspense fallback={<PageSpinner />}>
    <ReportPage />
  </Suspense>
)},
```

Apply selectively to the heavier routes (report viewer pulls in Recharts; intake form is large). With everything in one bundle now (`apps/web`), it's also worth lazy-loading the advisor and internal-ops route groups (`/cases`, `/students/:id/*`, `/calibration`, `/leads`, `/document-verify`, `/data-ops`, `/outcomes`, `/users`) so a student's initial load doesn't pull in advisor-only chunks — see ADR-007's follow-ups. Not needed for tiny pages like the dashboard.
