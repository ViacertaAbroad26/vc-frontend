import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type ApiComponents } from "@viacerta/api-client";

export type FinancialPlan = ApiComponents["schemas"]["FinancialPlanResponse"];
type SaveFinancialPlanRequest = ApiComponents["schemas"]["SaveFinancialPlanRequest"];

const QUERY_KEY = ["studentFinancialPlan"];

export function useFinancialPlan() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiAxios.get<FinancialPlan>("/api/v1/portal/students/me/financial-plan");
      return data;
    },
  });
}

export function useSaveFinancialPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: SaveFinancialPlanRequest) => {
      const { data } = await apiAxios.put<FinancialPlan>("/api/v1/portal/students/me/financial-plan", body);
      return data;
    },
    onSuccess: (data) => qc.setQueryData(QUERY_KEY, data),
  });
}
