
import { QueryClientProvider } from "@tanstack/react-query";
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
      window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    };
    window.addEventListener("viacerta:session-expired", onExpired);
    return () => window.removeEventListener("viacerta:session-expired", onExpired);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}
