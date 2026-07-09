import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type DisputeResponse, type ResolveDisputeRequest } from "@viacerta/api-client";

export function useResolveDispute() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ disputeId, body }: { disputeId: string; body: ResolveDisputeRequest }) => {
      const { data } = await apiAxios.post<DisputeResponse>(`/api/v1/advisor/disputes/${disputeId}/resolve`, body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["advisor", "disputes"] });
    },
  });
}
