import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { AppRole } from "@viacerta/utils";
import { MemoryRouter, useRoutes } from "react-router-dom";

import { routeObjects } from "@/router";
import { useAuthStore } from "@/stores/auth-store";

function RouteTree() {
  return useRoutes(routeObjects);
}

function renderAt(path: string) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <RouteTree />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function setUser(role: AppRole) {
  useAuthStore.setState({
    user: {
      id: "u_1",
      email: "user@example.com",
      fullName: "Test User",
      role,
      studentId: null,
      orgId: null,
    },
    isLoading: false,
  });
}

describe("role-gated routing", () => {
  afterEach(() => {
    useAuthStore.setState({ user: null, isLoading: false });
  });

  it("redirects an unauthenticated user to /login", async () => {
    useAuthStore.setState({ user: null, isLoading: false });

    renderAt("/cases");

    expect(await screen.findByText("Sign in to your account")).toBeInTheDocument();
  });

  it("redirects a STUDENT away from an advisor-only route to /forbidden", async () => {
    setUser("STUDENT");

    renderAt("/cases");

    expect(await screen.findByText("Access denied")).toBeInTheDocument();
  });

  it("lets an ADVISOR reach an advisor-gated route", async () => {
    setUser("ADVISOR");

    renderAt("/cases");

    expect(await screen.findByRole("heading", { name: "Case queue" })).toBeInTheDocument();
  });

  it("lets a SUPER_ADMIN through any role-gated route", async () => {
    setUser("SUPER_ADMIN");

    renderAt("/data-ops");

    expect(await screen.findByRole("heading", { name: "Data ops" })).toBeInTheDocument();
  });

  describe.each<{ path: string; allowedRole: AppRole; heading: string }>([
    { path: "/cases", allowedRole: "ADVISOR", heading: "Case queue" },
    { path: "/students/student-1", allowedRole: "ADVISOR", heading: "Asha Mehta" },
    { path: "/students/student-1/assessment", allowedRole: "ADVISOR", heading: "Assessment" },
    { path: "/students/student-1/gcri", allowedRole: "ADVISOR", heading: "Country risk" },
    { path: "/students/student-1/report", allowedRole: "ADVISOR", heading: "Report builder" },
    { path: "/calibration", allowedRole: "SENIOR_ADVISOR", heading: "Calibration" },
    { path: "/leads", allowedRole: "COORDINATOR", heading: "Leads" },
    { path: "/document-verify", allowedRole: "APPS_OPS", heading: "Document verification" },
    { path: "/data-ops", allowedRole: "DATA_OPS", heading: "Data ops" },
    { path: "/outcomes", allowedRole: "CAREER_SERVICES", heading: "Outcomes" },
    { path: "/users", allowedRole: "ADMIN", heading: "Users" },
    { path: "/organizations", allowedRole: "SUPER_ADMIN", heading: "Branches" },
  ])("$path", ({ path, allowedRole, heading }) => {
    it(`allows a ${allowedRole} through`, async () => {
      setUser(allowedRole);

      renderAt(path);

      expect(await screen.findByRole("heading", { name: heading })).toBeInTheDocument();
    });

    it("redirects a STUDENT to /forbidden", async () => {
      setUser("STUDENT");

      renderAt(path);

      expect(await screen.findByText("Access denied")).toBeInTheDocument();
    });
  });
});
