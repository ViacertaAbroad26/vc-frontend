import { useQuery } from "@tanstack/react-query";
import { apiAxios } from "@viacerta/api-client";
import type { StudentJourney } from "@viacerta/api-client";

/** States where the backend is doing async work the student is waiting on. */
const POLLING_STATES = new Set(["INTAKE_COMPLETE", "AI_PRESCORED", "GCRI_RUN"]);

export function useJourney({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["journey"],
    enabled,
    queryFn: async () => {
      const { data } = await apiAxios.get<StudentJourney>("/api/v1/portal/students/me/journey");
      return data;
    },
    refetchInterval: (query) =>
      query.state.data && POLLING_STATES.has(query.state.data.currentState) ? 10_000 : false,
  });
}
