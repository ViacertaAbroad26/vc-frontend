import { useQuery } from "@tanstack/react-query";
import { ApiError, apiAxios, type ApiComponents } from "@viacerta/api-client";

export type StudentUniversitySelection = ApiComponents["schemas"]["StudentUniversitySelectionResponse"];

export function useUniversityStrategy() {
  return useQuery({
    queryKey: ["studentUniversitySelection"],
    queryFn: async () => {
      const { data } = await apiAxios.get<StudentUniversitySelection>(
        "/api/v1/portal/students/me/university-selection",
      );
      return data;
    },
    // A 404 means the country mapping isn't confirmed yet — a normal
    // "not ready" state, not a failure worth retrying.
    retry: (failureCount, error) => !(error instanceof ApiError && error.status === 404) && failureCount < 3,
  });
}
