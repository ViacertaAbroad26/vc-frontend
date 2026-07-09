import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type ApiComponents } from "@viacerta/api-client";

type JobAccepted = ApiComponents["schemas"]["JobAcceptedResponse"];

export function useBuildReport(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.post<JobAccepted>(`/api/v1/advisor/students/${studentId}/report/build`);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["advisor", "student", studentId] });
    },
  });
}
