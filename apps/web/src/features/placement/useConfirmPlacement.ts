import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type ConfirmPlacementRequest, type PlacementResponse } from "@viacerta/api-client";

export function useConfirmPlacement(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: ConfirmPlacementRequest) => {
      const { data } = await apiAxios.post<PlacementResponse>(
        `/api/v1/advisor/students/${studentId}/placement/confirm`,
        body,
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["advisor", "placement", studentId], data);
      void qc.invalidateQueries({ queryKey: ["advisor", "student", studentId] });
      void qc.invalidateQueries({ queryKey: ["advisor", "cases"] });
    },
  });
}
