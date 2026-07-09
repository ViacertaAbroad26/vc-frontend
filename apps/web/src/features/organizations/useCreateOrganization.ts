import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type CreateOrganizationRequest, type OrganizationResponse } from "@viacerta/api-client";

export function useCreateOrganization() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateOrganizationRequest) => {
      const { data } = await apiAxios.post<OrganizationResponse>("/api/v1/internal/organizations", body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["internal", "organizations"] });
    },
  });
}
