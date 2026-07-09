import { useQuery } from "@tanstack/react-query";
import { apiAxios, type ApiComponents } from "@viacerta/api-client";

type AdvisorStudentDetail = ApiComponents["schemas"]["AdvisorStudentDetailResponse"];

export function useStudentDetail(studentId: string) {
  return useQuery({
    queryKey: ["advisor", "student", studentId],
    queryFn: async () => {
      const { data } = await apiAxios.get<AdvisorStudentDetail>(`/api/v1/advisor/students/${studentId}`);
      return data;
    },
  });
}
