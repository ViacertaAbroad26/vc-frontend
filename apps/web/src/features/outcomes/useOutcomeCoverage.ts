import { useQuery } from "@tanstack/react-query";
import { apiAxios, type OutcomeCoverageResponse } from "@viacerta/api-client";

export function useOutcomeCoverage() {
  return useQuery({
    queryKey: ["internal", "outcomes", "coverage"],
    queryFn: async () => {
      const { data } = await apiAxios.get<OutcomeCoverageResponse>("/api/v1/internal/outcomes/coverage");
      return data;
    },
  });
}
