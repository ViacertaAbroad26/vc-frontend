import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiAxios,
  type ApplicationTrackerResponse,
  type UpdateApplicationTrackerRequest,
} from "@viacerta/api-client";

export function useUpdateApplicationTracker(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateApplicationTrackerRequest) => {
      const { data } = await apiAxios.patch<ApplicationTrackerResponse>(
        `/api/v1/advisor/students/${studentId}/applications`,
        body,
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["advisor", "application-tracker", studentId], data);
    },
  });
}
