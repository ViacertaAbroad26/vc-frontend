import { useQuery } from "@tanstack/react-query";
import { apiAxios, type OrganizationListResponse } from "@viacerta/api-client";

export function useOrganizations(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["internal", "organizations"],
    queryFn: async () => {
      const { data } = await apiAxios.get<OrganizationListResponse>("/api/v1/internal/organizations");
      return data;
    },
    enabled: options.enabled ?? true,
  });
}
