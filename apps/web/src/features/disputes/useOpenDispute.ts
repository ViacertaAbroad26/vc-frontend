import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type DisputeResponse, type OpenDisputeRequest } from "@viacerta/api-client";

export function useOpenDispute() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: OpenDisputeRequest) => {
      const { data } = await apiAxios.post<DisputeResponse>("/api/v1/portal/students/me/disputes", body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["portal", "disputes"] });
    },
  });
}
