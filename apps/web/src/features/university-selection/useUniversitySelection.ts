import { useQuery } from "@tanstack/react-query";
import { apiAxios, type UniversitySelectionResponse } from "@viacerta/api-client";

export function useUniversitySelection(studentId: string) {
  return useQuery({
    queryKey: ["advisor", "university-selection", studentId],
    queryFn: async () => {
      const { data } = await apiAxios.get<UniversitySelectionResponse>(
        `/api/v1/advisor/students/${studentId}/university-selection`,
      );
      return data;
    },
  });
}
