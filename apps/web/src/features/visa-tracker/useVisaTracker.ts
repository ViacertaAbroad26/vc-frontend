import { useQuery } from "@tanstack/react-query";
import { apiAxios, type VisaTrackerResponse } from "@viacerta/api-client";

export function useVisaTracker(studentId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["advisor", "visa-tracker", studentId],
    queryFn: async () => {
      const { data } = await apiAxios.get<VisaTrackerResponse>(`/api/v1/advisor/students/${studentId}/visa`);
      return data;
    },
    enabled,
  });
}
