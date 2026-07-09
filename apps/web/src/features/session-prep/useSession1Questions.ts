import { useQuery } from "@tanstack/react-query";
import { apiAxios, type Session1QuestionSequenceResponse } from "@viacerta/api-client";

export function useSession1Questions(studentId: string) {
  return useQuery({
    queryKey: ["advisor", "session-prep", studentId],
    queryFn: async () => {
      const { data } = await apiAxios.get<Session1QuestionSequenceResponse>(
        `/api/v1/advisor/students/${studentId}/session1-questions`,
      );
      return data;
    },
    retry: false,
  });
}
