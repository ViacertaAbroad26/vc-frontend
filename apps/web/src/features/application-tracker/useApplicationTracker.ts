import { useQuery } from "@tanstack/react-query";
import { apiAxios, type ApplicationTrackerResponse } from "@viacerta/api-client";

export function useApplicationTracker(studentId: string) {
  return useQuery({
    queryKey: ["advisor", "application-tracker", studentId],
    queryFn: async () => {
      const { data } = await apiAxios.get<ApplicationTrackerResponse>(
        `/api/v1/advisor/students/${studentId}/applications`,
      );
      return data;
    },
  });
}
