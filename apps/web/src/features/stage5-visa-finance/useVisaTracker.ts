import { useQuery } from "@tanstack/react-query";
import { ApiError, apiAxios, type ApiComponents } from "@viacerta/api-client";

export type StudentVisaTracker = ApiComponents["schemas"]["StudentVisaTrackerResponse"];

export function useVisaTracker() {
  return useQuery({
    queryKey: ["studentVisaTracker"],
    queryFn: async () => {
      const { data } = await apiAxios.get<StudentVisaTracker>("/api/v1/portal/students/me/visa-tracker");
      return data;
    },
    // A 422 means Stage 4's application tracker isn't confirmed yet — a
    // normal "not ready" state, not a failure worth retrying.
    retry: (failureCount, error) => !(error instanceof ApiError && error.status === 422) && failureCount < 3,
  });
}
