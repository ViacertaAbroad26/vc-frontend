import { useQuery } from "@tanstack/react-query";
import { apiAxios, type OutcomeCorrelationResponse } from "@viacerta/api-client";

export function useCalibrationCorrelations(enabled: boolean) {
  return useQuery({
    queryKey: ["advisor", "calibration", "correlations"],
    queryFn: async () => {
      const { data } = await apiAxios.get<OutcomeCorrelationResponse>("/api/v1/advisor/calibration/correlations");
      return data;
    },
    enabled,
  });
}
