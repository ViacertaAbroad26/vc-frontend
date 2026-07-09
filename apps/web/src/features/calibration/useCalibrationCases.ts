import { useQuery } from "@tanstack/react-query";
import { apiAxios, type CalibrationCaseList } from "@viacerta/api-client";

export function useCalibrationCases() {
  return useQuery({
    queryKey: ["advisor", "calibration", "cases"],
    queryFn: async () => {
      const { data } = await apiAxios.get<CalibrationCaseList>("/api/v1/advisor/calibration/cases");
      return data;
    },
  });
}
