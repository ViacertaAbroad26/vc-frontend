import { useQuery } from "@tanstack/react-query";
import { apiAxios, type PlacementResponse } from "@viacerta/api-client";

export function usePlacement(studentId: string) {
  return useQuery({
    queryKey: ["advisor", "placement", studentId],
    queryFn: async () => {
      const { data } = await apiAxios.get<PlacementResponse>(`/api/v1/advisor/students/${studentId}/placement`);
      return data;
    },
  });
}
