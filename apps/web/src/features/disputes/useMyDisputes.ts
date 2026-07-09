import { useQuery } from "@tanstack/react-query";
import { apiAxios, type DisputeListResponse } from "@viacerta/api-client";

export function useMyDisputes() {
  return useQuery({
    queryKey: ["portal", "disputes"],
    queryFn: async () => {
      const { data } = await apiAxios.get<DisputeListResponse>("/api/v1/portal/students/me/disputes");
      return data;
    },
  });
}
