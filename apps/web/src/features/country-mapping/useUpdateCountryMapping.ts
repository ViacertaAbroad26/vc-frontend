import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type CountryMappingResponse, type UpdateCountryMappingRequest } from "@viacerta/api-client";

export function useUpdateCountryMapping(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateCountryMappingRequest) => {
      const { data } = await apiAxios.patch<CountryMappingResponse>(
        `/api/v1/advisor/students/${studentId}/country-mapping`,
        body,
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["advisor", "country-mapping", studentId], data);
    },
  });
}
