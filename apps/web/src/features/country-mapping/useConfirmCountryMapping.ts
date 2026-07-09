import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type ConfirmCountryMappingRequest, type CountryMappingResponse } from "@viacerta/api-client";

export function useConfirmCountryMapping(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: ConfirmCountryMappingRequest) => {
      const { data } = await apiAxios.post<CountryMappingResponse>(
        `/api/v1/advisor/students/${studentId}/country-mapping/confirm`,
        body,
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["advisor", "country-mapping", studentId], data);
      void qc.invalidateQueries({ queryKey: ["advisor", "student", studentId] });
      void qc.invalidateQueries({ queryKey: ["advisor", "cases"] });
    },
  });
}
