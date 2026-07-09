import { useQuery } from "@tanstack/react-query";
import { apiAxios, type PreDepartureResponse } from "@viacerta/api-client";

export function usePreDeparture(studentId: string) {
  return useQuery({
    queryKey: ["advisor", "pre-departure", studentId],
    queryFn: async () => {
      const { data } = await apiAxios.get<PreDepartureResponse>(
        `/api/v1/advisor/students/${studentId}/pre-departure`,
      );
      return data;
    },
  });
}
