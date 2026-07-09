import { useQuery } from "@tanstack/react-query";
import { apiAxios, type FreshnessResponse } from "@viacerta/api-client";

export function useFreshness() {
  return useQuery({
    queryKey: ["internal", "data-ops", "freshness"],
    queryFn: async () => {
      const { data } = await apiAxios.get<FreshnessResponse>("/api/v1/internal/data-ops/freshness");
      return data;
    },
  });
}
