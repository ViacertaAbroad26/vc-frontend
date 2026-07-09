import { useQuery } from "@tanstack/react-query";
import { apiAxios, type ConfigurationListResponse, type ConfigurationType } from "@viacerta/api-client";

/** Shared reference-data lookups (states, education boards, etc.) from /api/v1/configurations. */
export function useConfigurations(params: {
  type: ConfigurationType;
  parentCode?: string | null | undefined;
  enabled?: boolean | undefined;
}) {
  const { type, parentCode, enabled = true } = params;

  return useQuery({
    queryKey: ["configurations", type, parentCode ?? null],
    queryFn: async () => {
      const { data } = await apiAxios.get<ConfigurationListResponse>("/api/v1/configurations", {
        params: { type, ...(parentCode ? { parentCode } : {}) },
      });
      return data.data;
    },
    enabled,
    staleTime: 60 * 60_000,
  });
}
