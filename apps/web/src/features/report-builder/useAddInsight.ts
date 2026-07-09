import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type AdvisorReport, type ApiComponents } from "@viacerta/api-client";

type InsightRequest = ApiComponents["schemas"]["InsightRequest"];

export function useAddInsight(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: InsightRequest) => {
      const { data } = await apiAxios.post<AdvisorReport>(
        `/api/v1/advisor/students/${studentId}/report/insight`,
        body,
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["advisor", "report", studentId], data);
    },
  });
}
