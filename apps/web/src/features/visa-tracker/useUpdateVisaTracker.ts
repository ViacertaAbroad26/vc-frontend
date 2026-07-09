import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type UpdateVisaTrackerRequest, type VisaTrackerResponse } from "@viacerta/api-client";

export function useUpdateVisaTracker(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateVisaTrackerRequest) => {
      const { data } = await apiAxios.patch<VisaTrackerResponse>(
        `/api/v1/advisor/students/${studentId}/visa`,
        body,
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["advisor", "visa-tracker", studentId], data);
    },
  });
}
