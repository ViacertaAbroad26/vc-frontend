import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type Session1QuestionSequenceResponse } from "@viacerta/api-client";

export function useApproveSession1Questions(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.post<Session1QuestionSequenceResponse>(
        `/api/v1/advisor/students/${studentId}/session1-questions/approve`,
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["advisor", "session-prep", studentId], data);
    },
  });
}
