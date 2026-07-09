import { useMutation } from "@tanstack/react-query";
import { apiAxios, type SaveIntakeResponse } from "@viacerta/api-client";

import { updateIntakeCacheAnswers } from "./intake-cache";

export function useIntakeSave(submissionId: string) {
  return useMutation({
    mutationFn: async (body: { answers: Record<string, unknown> }) => {
      const { data } = await apiAxios.patch<SaveIntakeResponse>(
        `/api/v1/portal/students/me/intake/${submissionId}`,
        body,
      );
      return data;
    },
    onSuccess: (_data, body) => {
      updateIntakeCacheAnswers(submissionId, body.answers);
    },
  });
}
