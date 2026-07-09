import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type OutcomeResponse, type OutcomeYear3Request } from "@viacerta/api-client";

export function useCaptureYear3Outcome() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: OutcomeYear3Request) => {
      const { data } = await apiAxios.post<OutcomeResponse>("/api/v1/internal/outcomes/year3", body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["internal", "outcomes", "coverage"] });
    },
  });
}
