import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type ApiComponents } from "@viacerta/api-client";

export type CareerSuccess = ApiComponents["schemas"]["CareerSuccessResponse"];
type UpdateCareerSignalsRequest = ApiComponents["schemas"]["UpdateCareerSignalsRequest"];
type SaveOffersRequest = ApiComponents["schemas"]["SaveOffersRequest"];

const QUERY_KEY = ["studentCareerSuccess"];

export function useCareerSuccess() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiAxios.get<CareerSuccess>("/api/v1/portal/students/me/career-success");
      return data;
    },
  });
}

export function useSaveCareerSignals() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateCareerSignalsRequest) => {
      const { data } = await apiAxios.put<CareerSuccess>(
        "/api/v1/portal/students/me/career-success/signals",
        body,
      );
      return data;
    },
    onSuccess: (data) => qc.setQueryData(QUERY_KEY, data),
  });
}

export function useSaveOffers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: SaveOffersRequest) => {
      const { data } = await apiAxios.put<CareerSuccess>("/api/v1/portal/students/me/career-success/offers", body);
      return data;
    },
    onSuccess: (data) => qc.setQueryData(QUERY_KEY, data),
  });
}
