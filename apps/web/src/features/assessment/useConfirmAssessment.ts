import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type AdvisorAssessment } from "@viacerta/api-client";

export function useConfirmAssessment(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.post<AdvisorAssessment>(
        `/api/v1/advisor/students/${studentId}/assessment/confirm`,
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["advisor", "assessment", studentId] });
      void qc.invalidateQueries({ queryKey: ["advisor", "cases"] });
    },
  });
}
