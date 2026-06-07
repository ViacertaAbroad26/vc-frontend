# 05 — Auth & Routing

> JWT in memory + localStorage. React Router v6 with role-based guards. Two apps, different role sets.

## Token lifecycle

1. **Register / Login** → backend returns `{ accessToken, refreshToken, user }`. Store both in localStorage via `authStorage` (`docs/04-api-client.md`). Store `user` in Zustand `auth-store`.
2. **Every API call** → `axios` request interceptor attaches `Authorization: Bearer <accessToken>`.
3. **401 from API** → response interceptor calls `/auth/refresh` once, rotates tokens, retries the original request.
4. **Refresh fails** → `authStorage.clear()`, dispatch `viacerta:session-expired` event. App router listens and redirects to `/login`.
5. **Logout** → POST `/auth/logout` with refresh token, then `authStorage.clear()`, route to `/login`.

## Zustand auth store

```ts
// apps/portal/src/stores/auth-store.ts
import { create } from "zustand";
import { authStorage } from "@viacerta/api-client/portal";

type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: "STUDENT" | "PARENT";
  studentId: string | null;
};

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
    authStorage.clear("portal");
    set({ user: null });
  },
}));
```

Advisor app version has more roles:

```ts
// apps/advisor/src/stores/auth-store.ts
type AdvisorRole =
  | "ADVISOR" | "SENIOR_ADVISOR" | "COORDINATOR"
  | "APPS_OPS" | "VISA_OPS" | "CAREER_SERVICES"
  | "DATA_OPS" | "ADMIN";

type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: AdvisorRole;
};
// ... same shape
```

## Boot — hydrating session

```tsx
// apps/portal/src/App.tsx
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { portalAxios } from "@viacerta/api-client/portal";

import { router } from "./router";
import { queryClient } from "./lib/query-client";
import { useAuthStore } from "./stores/auth-store";

export function App() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await portalAxios.get("/api/v1/auth/me");
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [setUser, setLoading]);

  // Listen for session-expired from refresh interceptor
  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      window.location.assign("/login");
    };
    window.addEventListener("viacerta:session-expired", onExpired);
    return () => window.removeEventListener("viacerta:session-expired", onExpired);
  }, [setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

## ProtectedRoute

```tsx
// apps/portal/src/components/shared/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { type PropsWithChildren } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Spinner } from "@viacerta/ui";

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

## RoleGate

```tsx
// apps/advisor/src/components/shared/RoleGate.tsx
import { Navigate } from "react-router-dom";
import { type PropsWithChildren } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function RoleGate({
  allow, children,
}: PropsWithChildren<{ allow: ReadonlyArray<string> }>) {
  const user = useAuthStore((s) => s.user);
  if (!user || !allow.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }
  return <>{children}</>;
}
```

Usage:

```tsx
<RoleGate allow={["DATA_OPS", "ADMIN", "SENIOR_ADVISOR"]}>
  <DataOpsPage />
</RoleGate>
```

## Routers

### Portal — `apps/portal/src/router.tsx`

```tsx
import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

// auth
import LoginPage from "@/routes/auth/LoginPage";
import RegisterPage from "@/routes/auth/RegisterPage";

// student
import DashboardPage from "@/routes/student/DashboardPage";
import JourneyPage from "@/routes/student/JourneyPage";
import IntakeStartPage from "@/routes/student/IntakeStartPage";
import IntakeFormPage from "@/routes/student/IntakeFormPage";
import DocumentsPage from "@/routes/student/DocumentsPage";
import PendingPage from "@/routes/student/PendingPage";
import ReportPage from "@/routes/student/ReportPage";
import DecisionGatePage from "@/routes/student/DecisionGatePage";

// parent
import ParentSummaryPage from "@/routes/parent/ParentSummaryPage";

import NotFoundPage from "@/routes/NotFoundPage";

export const router = createBrowserRouter([
  // Public
  { path: "/login",    element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  // Authenticated
  {
    element: <ProtectedRoute><AppShell /></ProtectedRoute>,
    children: [
      { path: "/",                  element: <DashboardPage /> },
      { path: "/journey",           element: <JourneyPage /> },

      { path: "/intake",            element: <IntakeStartPage /> },
      { path: "/intake/:submissionId", element: <IntakeFormPage /> },

      { path: "/documents",         element: <DocumentsPage /> },
      { path: "/pending",           element: <PendingPage /> },
      { path: "/report",            element: <ReportPage /> },
      { path: "/decision",          element: <DecisionGatePage /> },

      // Parent
      { path: "/parent/students/:studentId", element: <ParentSummaryPage /> },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);
```

### Advisor — `apps/advisor/src/router.tsx`

```tsx
import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { RoleGate } from "@/components/shared/RoleGate";

import LoginPage from "@/routes/auth/LoginPage";

import CaseQueuePage from "@/routes/advisor/CaseQueuePage";
import StudentDetailPage from "@/routes/advisor/StudentDetailPage";
import AssessmentPage from "@/routes/advisor/AssessmentPage";
import GcriPage from "@/routes/advisor/GcriPage";
import ReportBuilderPage from "@/routes/advisor/ReportBuilderPage";
import CalibrationPage from "@/routes/advisor/CalibrationPage";

import LeadsPage from "@/routes/internal/LeadsPage";
import DocumentVerifyPage from "@/routes/internal/DocumentVerifyPage";
import DataOpsPage from "@/routes/internal/DataOpsPage";
import OutcomesPage from "@/routes/internal/OutcomesPage";
import UsersPage from "@/routes/internal/UsersPage";

import ForbiddenPage from "@/routes/ForbiddenPage";
import NotFoundPage from "@/routes/NotFoundPage";

const ADVISOR_ROLES   = ["ADVISOR", "SENIOR_ADVISOR"] as const;
const SENIOR_ROLES    = ["SENIOR_ADVISOR", "ADMIN"] as const;
const COORD_ROLES     = ["COORDINATOR", "ADMIN"] as const;
const DOCS_OPS_ROLES  = ["APPS_OPS", "VISA_OPS", "ADMIN"] as const;
const DATA_OPS_ROLES  = ["DATA_OPS", "SENIOR_ADVISOR", "ADMIN"] as const;
const CAREER_ROLES    = ["CAREER_SERVICES", "ADMIN"] as const;
const ADMIN_ONLY      = ["ADMIN"] as const;

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },

  {
    element: <ProtectedRoute><AppShell /></ProtectedRoute>,
    children: [
      { path: "/", element: <Navigate to="/cases" replace /> },

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

      // Internal
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

      { path: "/forbidden", element: <ForbiddenPage /> },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);
```

## Post-login routing

After login, route by role to the right landing page:

```tsx
// apps/portal/src/features/auth/useLogin.ts
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { portalAxios, authStorage } from "@viacerta/api-client/portal";
import { useAuthStore } from "@/stores/auth-store";

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      const { data } = await portalAxios.post("/api/v1/auth/login", body);
      return data;
    },
    onSuccess: (resp) => {
      authStorage.setTokens("portal", resp.tokens);
      setUser(resp.user);
      const from = (location.state as any)?.from ?? destinationByRole(resp.user.role);
      navigate(from, { replace: true });
    },
  });
}

function destinationByRole(role: string): string {
  if (role === "PARENT") return "/parent";
  return "/";
}
```

Advisor app version routes ADVISOR → `/cases`, COORDINATOR → `/leads`, DATA_OPS → `/data-ops`, ADMIN → `/users`.

## Named routes — `@viacerta/utils/routes.ts`

```ts
// packages/utils/src/routes.ts
export const portalRoutes = {
  login:        "/login",
  register:     "/register",
  dashboard:    "/",
  journey:      "/journey",
  intakeStart:  "/intake",
  intakeForm:   (id: string) => `/intake/${id}`,
  documents:    "/documents",
  pending:      "/pending",
  report:       "/report",
  decision:     "/decision",
  parent:       (studentId: string) => `/parent/students/${studentId}`,
} as const;

export const advisorRoutes = {
  login:           "/login",
  cases:           "/cases",
  studentDetail:   (id: string) => `/students/${id}`,
  assessment:      (id: string) => `/students/${id}/assessment`,
  gcri:            (id: string) => `/students/${id}/gcri`,
  reportBuilder:   (id: string) => `/students/${id}/report`,
  calibration:     "/calibration",
  leads:           "/leads",
  documentVerify:  "/document-verify",
  dataOps:         "/data-ops",
  outcomes:        "/outcomes",
  users:           "/users",
} as const;
```

Imported into the right app side as needed. The portal app's `routes.ts` doesn't expose advisor routes; ESLint config ensures no cross-import.

## Session-expired UX

When the refresh interceptor fails (refresh-token expired, revoked, or reuse-detected), the app:

1. Clears local state via `authStorage.clear()` and `useAuthStore.logout()`.
2. Shows a toast: "Your session expired. Please sign in again."
3. Navigates to `/login` with `state.from` set to the current path so the user lands back where they were after re-auth.

```tsx
// apps/portal/src/App.tsx (excerpt)
useEffect(() => {
  const onExpired = () => {
    toast.warning("Your session expired. Please sign in again.");
    useAuthStore.getState().logout();
    window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  };
  window.addEventListener("viacerta:session-expired", onExpired);
  return () => window.removeEventListener("viacerta:session-expired", onExpired);
}, []);
```

## Forbidden / 404 pages

```tsx
// apps/portal/src/routes/NotFoundPage.tsx
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

Apply selectively to the heavier routes (report viewer pulls in Recharts; intake form is large). Not needed for tiny pages like dashboard.
