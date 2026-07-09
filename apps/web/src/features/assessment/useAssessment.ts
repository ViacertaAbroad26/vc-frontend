import { useQuery } from "@tanstack/react-query";
import { apiAxios, type AdvisorAssessment } from "@viacerta/api-client";

export function useAssessment(studentId: string) {
  return useQuery({
    queryKey: ["advisor", "assessment", studentId],
    queryFn: async () => {
      const { data } = await apiAxios.get<AdvisorAssessment>(
        `/api/v1/advisor/students/${studentId}/assessment`,
      );
      return data;
    },
  });
}
