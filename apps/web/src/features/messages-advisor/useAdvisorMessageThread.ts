import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type ApiComponents } from "@viacerta/api-client";

export type AdvisorMessageThread = ApiComponents["schemas"]["AdvisorMessageThreadResponse"];

export function useAdvisorMessageThread(studentId: string) {
  return useQuery({
    queryKey: ["advisor", "messages", studentId],
    queryFn: async () => {
      const { data } = await apiAxios.get<AdvisorMessageThread>(`/api/v1/advisor/students/${studentId}/messages`);
      return data;
    },
    refetchInterval: 10_000,
  });
}

export function useSendAdvisorMessage(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      const { data } = await apiAxios.post<AdvisorMessageThread>(
        `/api/v1/advisor/students/${studentId}/messages`,
        { text },
      );
      return data;
    },
    onSuccess: (data) => qc.setQueryData(["advisor", "messages", studentId], data),
  });
}

export function useMarkAdvisorThreadRead(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.post<AdvisorMessageThread>(
        `/api/v1/advisor/students/${studentId}/messages/read`,
      );
      return data;
    },
    onSuccess: (data) => qc.setQueryData(["advisor", "messages", studentId], data),
  });
}
