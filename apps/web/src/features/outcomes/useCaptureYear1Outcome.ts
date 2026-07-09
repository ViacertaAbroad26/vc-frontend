import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type OutcomeResponse, type OutcomeYear1Request } from "@viacerta/api-client";

export function useCaptureYear1Outcome() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: OutcomeYear1Request) => {
      const { data } = await apiAxios.post<OutcomeResponse>("/api/v1/internal/outcomes", body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["internal", "outcomes", "coverage"] });
    },
  });
}
