import { useQuery } from "@tanstack/react-query";
import { apiAxios, type ParentSummaryResponse } from "@viacerta/api-client";

export function useParentSummary(studentId: string) {
  return useQuery({
    queryKey: ["parentSummary", studentId],
    queryFn: async () => {
      const { data } = await apiAxios.get<ParentSummaryResponse>(`/api/v1/portal/parent/students/${studentId}`);
      return data;
    },
  });
}
