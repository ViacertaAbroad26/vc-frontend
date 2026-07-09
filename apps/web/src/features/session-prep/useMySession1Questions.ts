import { useQuery } from "@tanstack/react-query";
import { apiAxios, type StudentSession1QuestionSequenceResponse } from "@viacerta/api-client";

export function useMySession1Questions() {
  return useQuery({
    queryKey: ["portal", "session1-questions"],
    queryFn: async () => {
      const { data } = await apiAxios.get<StudentSession1QuestionSequenceResponse>(
        "/api/v1/portal/students/me/session1-questions",
      );
      return data;
    },
    retry: false,
  });
}
