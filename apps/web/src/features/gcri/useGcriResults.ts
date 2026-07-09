import { useQuery } from "@tanstack/react-query";
import { apiAxios, type GcriResults } from "@viacerta/api-client";

export function useGcriResults(studentId: string) {
  return useQuery({
    queryKey: ["advisor", "gcri", studentId],
    queryFn: async () => {
      const { data } = await apiAxios.get<GcriResults>(`/api/v1/advisor/students/${studentId}/gcri`);
      return data;
    },
  });
}
