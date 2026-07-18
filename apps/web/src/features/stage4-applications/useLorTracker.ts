import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type ApiComponents } from "@viacerta/api-client";

export type LorTracker = ApiComponents["schemas"]["LorTrackerResponse"];
type SaveLorTrackerRequest = ApiComponents["schemas"]["SaveLorTrackerRequest"];

const QUERY_KEY = ["studentLorTracker"];

export function useLorTracker() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiAxios.get<LorTracker>("/api/v1/portal/students/me/lor-tracker");
      return data;
    },
  });
}

export function useSaveLorTracker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: SaveLorTrackerRequest) => {
      const { data } = await apiAxios.put<LorTracker>("/api/v1/portal/students/me/lor-tracker", body);
      return data;
    },
    onSuccess: (data) => qc.setQueryData(QUERY_KEY, data),
  });
}
