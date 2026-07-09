import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type PreDepartureResponse, type UpdatePreDepartureRequest } from "@viacerta/api-client";

export function useUpdatePreDeparture(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdatePreDepartureRequest) => {
      const { data } = await apiAxios.patch<PreDepartureResponse>(
        `/api/v1/advisor/students/${studentId}/pre-departure`,
        body,
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["advisor", "pre-departure", studentId], data);
    },
  });
}
