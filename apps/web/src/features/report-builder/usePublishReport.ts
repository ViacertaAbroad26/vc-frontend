import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type AdvisorReport } from "@viacerta/api-client";

export function usePublishReport(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.post<AdvisorReport>(`/api/v1/advisor/students/${studentId}/report/publish`);
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["advisor", "report", studentId], data);
      void qc.invalidateQueries({ queryKey: ["advisor", "cases"] });
    },
  });
}
