import { useQuery } from "@tanstack/react-query";
import { ApiError, apiAxios, type ApiComponents } from "@viacerta/api-client";

export type StudentApplicationTracker = ApiComponents["schemas"]["StudentApplicationTrackerResponse"];

export function useApplicationTracker() {
  return useQuery({
    queryKey: ["studentApplicationTracker"],
    queryFn: async () => {
      const { data } = await apiAxios.get<StudentApplicationTracker>(
        "/api/v1/portal/students/me/application-tracker",
      );
      return data;
    },
    // A 422 means Stage 3's university selection isn't confirmed yet — a
    // normal "not ready" state, not a failure worth retrying.
    retry: (failureCount, error) => !(error instanceof ApiError && error.status === 422) && failureCount < 3,
  });
}
