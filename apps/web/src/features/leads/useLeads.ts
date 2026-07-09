import { useQuery } from "@tanstack/react-query";
import { apiAxios, type LeadListResponse } from "@viacerta/api-client";

export function useLeads() {
  return useQuery({
    queryKey: ["internal", "leads"],
    queryFn: async () => {
      const { data } = await apiAxios.get<LeadListResponse>("/api/v1/internal/leads", {
        params: { limit: 50 },
      });
      return data;
    },
  });
}
