import { useQuery } from "@tanstack/react-query";
import { apiAxios, type UniversityListResponse } from "@viacerta/api-client";

export function useUniversitySearch(search: string) {
  const query = search.trim();
  return useQuery({
    queryKey: ["universities", "search", query],
    queryFn: async () => {
      const { data } = await apiAxios.get<UniversityListResponse>("/api/v1/universities", {
        params: { search: query, limit: 10 },
      });
      return data;
    },
    enabled: query.length >= 2,
    staleTime: 60_000,
  });
}
