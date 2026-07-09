import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiAxios,
  type StudentSession1QuestionSequenceResponse,
  type SubmitSession1AnswersRequest,
} from "@viacerta/api-client";

export function useSubmitSession1Answers() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: SubmitSession1AnswersRequest) => {
      const { data } = await apiAxios.post<StudentSession1QuestionSequenceResponse>(
        "/api/v1/portal/students/me/session1-questions/answers",
        body,
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["portal", "session1-questions"], data);
    },
  });
}
