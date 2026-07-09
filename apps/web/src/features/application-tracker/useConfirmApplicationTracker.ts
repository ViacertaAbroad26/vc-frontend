import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiAxios,
  type ApplicationTrackerResponse,
  type ConfirmApplicationTrackerRequest,
} from "@viacerta/api-client";

export function useConfirmApplicationTracker(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: ConfirmApplicationTrackerRequest) => {
      const { data } = await apiAxios.post<ApplicationTrackerResponse>(
        `/api/v1/advisor/students/${studentId}/applications/confirm`,
        body,
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["advisor", "application-tracker", studentId], data);
      void qc.invalidateQueries({ queryKey: ["advisor", "student", studentId] });
      void qc.invalidateQueries({ queryKey: ["advisor", "cases"] });
    },
  });
}
