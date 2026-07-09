import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type HardcodedDowngradeRequest, type VersionResponse } from "@viacerta/api-client";

export function useHardcodedDowngrade() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: HardcodedDowngradeRequest) => {
      const { data } = await apiAxios.post<VersionResponse>("/api/v1/internal/data-ops/hardcoded-downgrade", body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["internal", "data-ops", "freshness"] });
    },
  });
}
