import { useQuery } from "@tanstack/react-query";
import { ApiError, apiAxios, type AdvisorReport } from "@viacerta/api-client";

export function useAdvisorReport(studentId: string) {
  return useQuery<AdvisorReport | null>({
    queryKey: ["advisor", "report", studentId],
    queryFn: async () => {
      try {
        const { data } = await apiAxios.get<AdvisorReport>(`/api/v1/advisor/students/${studentId}/report`);
        return data;
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
  });
}
