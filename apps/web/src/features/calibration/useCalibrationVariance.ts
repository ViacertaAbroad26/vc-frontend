import { useQuery } from "@tanstack/react-query";
import { apiAxios, type VarianceResponse } from "@viacerta/api-client";

export function useCalibrationVariance(enabled: boolean) {
  return useQuery({
    queryKey: ["advisor", "calibration", "variance"],
    queryFn: async () => {
      const { data } = await apiAxios.get<VarianceResponse>("/api/v1/advisor/calibration/variance");
      return data;
    },
    enabled,
  });
}
