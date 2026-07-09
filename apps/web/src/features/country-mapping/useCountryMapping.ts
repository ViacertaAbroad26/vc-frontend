import { useQuery } from "@tanstack/react-query";
import { apiAxios, type CountryMappingResponse } from "@viacerta/api-client";

export function useCountryMapping(studentId: string) {
  return useQuery({
    queryKey: ["advisor", "country-mapping", studentId],
    queryFn: async () => {
      const { data } = await apiAxios.get<CountryMappingResponse>(
        `/api/v1/advisor/students/${studentId}/country-mapping`,
      );
      return data;
    },
  });
}
