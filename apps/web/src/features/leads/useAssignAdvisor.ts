import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type MessageResponse } from "@viacerta/api-client";

export function useAssignAdvisor() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, advisorId }: { studentId: string; advisorId: string }) => {
      const { data } = await apiAxios.post<MessageResponse>(
        `/api/v1/internal/students/${studentId}/assign-advisor`,
        { advisorId },
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["internal", "leads"] });
    },
  });
}
