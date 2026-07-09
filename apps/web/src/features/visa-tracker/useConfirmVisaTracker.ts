import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type ConfirmVisaTrackerRequest, type VisaTrackerResponse } from "@viacerta/api-client";

export function useConfirmVisaTracker(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: ConfirmVisaTrackerRequest) => {
      const { data } = await apiAxios.post<VisaTrackerResponse>(
        `/api/v1/advisor/students/${studentId}/visa/confirm`,
        body,
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["advisor", "visa-tracker", studentId], data);
      void qc.invalidateQueries({ queryKey: ["advisor", "student", studentId] });
      void qc.invalidateQueries({ queryKey: ["advisor", "cases"] });
    },
  });
}
