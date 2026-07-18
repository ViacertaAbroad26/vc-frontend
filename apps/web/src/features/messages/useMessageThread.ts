import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiAxios, type ApiComponents } from "@viacerta/api-client";

export type StudentMessageThread = ApiComponents["schemas"]["StudentMessageThreadResponse"];

const QUERY_KEY = ["studentMessageThread"];

export function useMessageThread({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: QUERY_KEY,
    enabled,
    queryFn: async () => {
      const { data } = await apiAxios.get<StudentMessageThread>("/api/v1/portal/students/me/messages");
      return data;
    },
    // A 422 means no advisor assigned yet — a normal "not ready" state.
    retry: (failureCount, error) => !(error instanceof ApiError && error.status === 422) && failureCount < 3,
    // Poll while the page is open so new advisor replies show up without a
    // websocket/SSE backend (none exists in this codebase).
    refetchInterval: enabled ? 10_000 : false,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      const { data } = await apiAxios.post<StudentMessageThread>("/api/v1/portal/students/me/messages", { text });
      return data;
    },
    onSuccess: (data) => qc.setQueryData(QUERY_KEY, data),
  });
}

export function useMarkThreadRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.post<StudentMessageThread>("/api/v1/portal/students/me/messages/read");
      return data;
    },
    onSuccess: (data) => qc.setQueryData(QUERY_KEY, data),
  });
}
