import { useMutation } from "@tanstack/react-query";
import { apiAxios, type RubricCalibrationDraftResponse } from "@viacerta/api-client";

export function useDraftRubric() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.post<RubricCalibrationDraftResponse>("/api/v1/advisor/calibration/rubric-draft");
      return data;
    },
  });
}
