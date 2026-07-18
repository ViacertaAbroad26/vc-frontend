import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type ApiComponents } from "@viacerta/api-client";

export type StudentEssay = ApiComponents["schemas"]["StudentEssayResponse"];

const QUERY_KEY = ["studentEssaySop"];

export function useEssay() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiAxios.get<StudentEssay>("/api/v1/portal/students/me/essays/sop");
      return data;
    },
  });
}

export function useSaveEssay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      const { data } = await apiAxios.put<StudentEssay>("/api/v1/portal/students/me/essays/sop", { text });
      return data;
    },
    onSuccess: (data) => qc.setQueryData(QUERY_KEY, data),
  });
}

export function useReviewEssay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.post<StudentEssay>("/api/v1/portal/students/me/essays/sop/review");
      return data;
    },
    onSuccess: (data) => qc.setQueryData(QUERY_KEY, data),
  });
}
