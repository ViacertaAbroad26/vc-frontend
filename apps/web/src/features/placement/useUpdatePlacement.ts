import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type PlacementResponse, type UpdatePlacementRequest } from "@viacerta/api-client";

export function useUpdatePlacement(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdatePlacementRequest) => {
      const { data } = await apiAxios.patch<PlacementResponse>(
        `/api/v1/advisor/students/${studentId}/placement`,
        body,
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["advisor", "placement", studentId], data);
    },
  });
}
