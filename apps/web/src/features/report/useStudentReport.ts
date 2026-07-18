import { useQuery } from "@tanstack/react-query";
import { ApiError, apiAxios, type StudentReport } from "@viacerta/api-client";

export function useStudentReport({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["studentReport"],
    enabled,
    queryFn: async () => {
      const { data } = await apiAxios.get<StudentReport>("/api/v1/portal/students/me/report");
      return data;
    },
    // A 404 here means the advisor hasn't published a report yet — not a
    // real failure, so don't burn through retry backoff before showing the
    // "report is being prepared" state.
    retry: (failureCount, error) => !(error instanceof ApiError && error.status === 404) && failureCount < 3,
    refetchInterval: (query) => {
      if (!enabled) return false;
      if (query.state.data && !query.state.data.publishedAt) return 5_000;
      if (query.state.error instanceof ApiError && query.state.error.status === 404) return 5_000;
      return false;
    },
  });
}
