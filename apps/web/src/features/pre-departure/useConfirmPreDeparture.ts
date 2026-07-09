import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type ConfirmPreDepartureRequest, type PreDepartureResponse } from "@viacerta/api-client";

export function useConfirmPreDeparture(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: ConfirmPreDepartureRequest) => {
      const { data } = await apiAxios.post<PreDepartureResponse>(
        `/api/v1/advisor/students/${studentId}/pre-departure/confirm`,
        body,
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["advisor", "pre-departure", studentId], data);
      void qc.invalidateQueries({ queryKey: ["advisor", "student", studentId] });
      void qc.invalidateQueries({ queryKey: ["advisor", "cases"] });
    },
  });
}
