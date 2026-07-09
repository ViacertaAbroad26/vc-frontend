import { useQuery } from "@tanstack/react-query";
import { apiAxios, type AdminOverviewResponse } from "@viacerta/api-client";

export function useAdminOverview() {
  return useQuery({
    queryKey: ["internal", "admin", "overview"],
    queryFn: async () => {
      const { data } = await apiAxios.get<AdminOverviewResponse>("/api/v1/internal/admin/overview");
      return data;
    },
  });
}
