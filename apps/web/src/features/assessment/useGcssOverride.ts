import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type AdvisorAssessment, type ApiComponents } from "@viacerta/api-client";

type OverrideRequest = ApiComponents["schemas"]["OverrideRequest"];

export function useGcssOverride(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: OverrideRequest) => {
      const { data } = await apiAxios.post<AdvisorAssessment>(
        `/api/v1/advisor/students/${studentId}/assessment/override`,
        body,
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["advisor", "assessment", studentId] });
    },
  });
}
