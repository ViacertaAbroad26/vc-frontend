
import { QueryClientProvider } from "@tanstack/react-query";
import { apiAxios, authStorage, type AuthUser } from "@viacerta/api-client";
import { Toaster, toast } from "@viacerta/ui";
import { SpeedInsights } from "@vercel/speed-insights/react";
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
      // No token stored at all (fresh/logged-out visit) — skip the network
      // call entirely. Hitting /auth/me here would 401, which the refresh
      // interceptor treats as an expired session and redirects, causing a
      // reload -> 401 -> redirect loop for every logged-out visitor.
      if (!authStorage.getAccessToken()) {
        setUser(null);
        return;
      }
      setLoading(true);
      try {
        const { data } = await apiAxios.get<AuthUser>("/api/v1/auth/me");
        if (!cancelled) setUser({ ...data, studentId: data.studentId ?? null, orgId: data.orgId ?? null });
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser, setLoading]);

  useEffect(() => {
    const onExpired = () => {
      toast.warning("Your session expired. Please sign in again.");
      useAuthStore.getState().logout();
      // Client-side navigation, not window.location.assign: a full reload
      // re-mounts App and re-triggers the /auth/me check above.
      void router.navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    };
    window.addEventListener("viacerta:session-expired", onExpired);
    return () => window.removeEventListener("viacerta:session-expired", onExpired);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
      <SpeedInsights />
    </QueryClientProvider>
  );
}
