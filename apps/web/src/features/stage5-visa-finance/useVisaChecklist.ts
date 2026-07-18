import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type ApiComponents } from "@viacerta/api-client";

export type VisaChecklist = ApiComponents["schemas"]["VisaChecklistResponse"];
type SaveVisaChecklistRequest = ApiComponents["schemas"]["SaveVisaChecklistRequest"];

const QUERY_KEY = ["studentVisaChecklist"];

export function useVisaChecklist() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiAxios.get<VisaChecklist>("/api/v1/portal/students/me/visa-checklist");
      return data;
    },
  });
}

export function useSaveVisaChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: SaveVisaChecklistRequest) => {
      const { data } = await apiAxios.put<VisaChecklist>("/api/v1/portal/students/me/visa-checklist", body);
      return data;
    },
    onSuccess: (data) => qc.setQueryData(QUERY_KEY, data),
  });
}
