import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type Session1QuestionSequenceResponse, type UpdateSession1QuestionsRequest } from "@viacerta/api-client";

export function useUpdateSession1Questions(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateSession1QuestionsRequest) => {
      const { data } = await apiAxios.put<Session1QuestionSequenceResponse>(
        `/api/v1/advisor/students/${studentId}/session1-questions`,
        body,
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["advisor", "session-prep", studentId], data);
    },
  });
}
