import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type AdvanceRequest, type StateResponse } from "@viacerta/api-client";

export function useAdvanceStage(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: AdvanceRequest) => {
      const { data } = await apiAxios.post<StateResponse>(
        `/api/v1/internal/workflow/students/${studentId}/advance`,
        body,
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["advisor", "student", studentId] });
      void qc.invalidateQueries({ queryKey: ["advisor", "cases"] });
    },
  });
}
