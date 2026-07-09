import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type ScoreRequest } from "@viacerta/api-client";

export function useScoreCase() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, body }: { caseId: string; body: ScoreRequest }) => {
      const { data } = await apiAxios.post(`/api/v1/advisor/calibration/cases/${caseId}/score`, body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["advisor", "calibration"] });
    },
  });
}
