import { useQuery } from "@tanstack/react-query";
import { apiAxios, type DisputeListResponse, type DisputeStatus } from "@viacerta/api-client";

export function useDisputes(status: DisputeStatus | undefined) {
  return useQuery({
    queryKey: ["advisor", "disputes", status],
    queryFn: async () => {
      const { data } = await apiAxios.get<DisputeListResponse>("/api/v1/advisor/disputes", {
        params: { status },
      });
      return data;
    },
  });
}
