import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type ApiComponents } from "@viacerta/api-client";

type GcriOverrideRequest = ApiComponents["schemas"]["GcriOverrideRequest"];
type GcriResult = ApiComponents["schemas"]["GcriResultResponse"];

export function useGcriOverride(studentId: string, country: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: GcriOverrideRequest) => {
      const { data } = await apiAxios.post<GcriResult>(
        `/api/v1/advisor/students/${studentId}/gcri/${country}/override`,
        body,
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["advisor", "gcri", studentId] });
    },
  });
}
