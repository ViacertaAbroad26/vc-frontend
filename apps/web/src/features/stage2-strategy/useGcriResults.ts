import { useQuery } from "@tanstack/react-query";
import { ApiError, apiAxios, type ApiComponents } from "@viacerta/api-client";

export type StudentGcriDetail = ApiComponents["schemas"]["StudentGcriDetailResponse"];

export function useGcriResults({ pollWhileMissing = false }: { pollWhileMissing?: boolean } = {}) {
  return useQuery({
    queryKey: ["studentGcri"],
    queryFn: async () => {
      const { data } = await apiAxios.get<StudentGcriDetail>("/api/v1/portal/students/me/gcri");
      return data;
    },
    // A 404 means Stage 2 hasn't been computed yet — a normal "not started"
    // state, not a failure worth retrying.
    retry: (failureCount, error) => !(error instanceof ApiError && error.status === 404) && failureCount < 3,
    // While the compute job is in flight after a trigger, poll briefly for
    // completion (same pattern as useStudentReport.ts).
    refetchInterval: (query) =>
      pollWhileMissing && query.state.error instanceof ApiError && query.state.error.status === 404
        ? 3_000
        : false,
  });
}
