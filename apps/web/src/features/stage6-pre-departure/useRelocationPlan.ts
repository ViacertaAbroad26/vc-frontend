import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type ApiComponents } from "@viacerta/api-client";

export type RelocationPlan = ApiComponents["schemas"]["RelocationPlanResponse"];
type UpdateRelocationPlanRequest = ApiComponents["schemas"]["UpdateRelocationPlanRequest"];
type SaveMilestonesRequest = ApiComponents["schemas"]["SaveMilestonesRequest"];

const QUERY_KEY = ["studentRelocationPlan"];

export function useRelocationPlan() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiAxios.get<RelocationPlan>("/api/v1/portal/students/me/relocation-plan");
      return data;
    },
  });
}

export function useSaveRelocationPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateRelocationPlanRequest) => {
      const { data } = await apiAxios.put<RelocationPlan>("/api/v1/portal/students/me/relocation-plan", body);
      return data;
    },
    onSuccess: (data) => qc.setQueryData(QUERY_KEY, data),
  });
}

export function useSaveMilestones() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: SaveMilestonesRequest) => {
      const { data } = await apiAxios.put<RelocationPlan>(
        "/api/v1/portal/students/me/relocation-plan/milestones",
        body,
      );
      return data;
    },
    onSuccess: (data) => qc.setQueryData(QUERY_KEY, data),
  });
}
