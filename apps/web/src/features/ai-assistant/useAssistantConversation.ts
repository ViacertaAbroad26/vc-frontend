import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type ApiComponents } from "@viacerta/api-client";

export type AssistantConversation = ApiComponents["schemas"]["AssistantConversationResponse"];

const QUERY_KEY = ["studentAssistantConversation"];

export function useAssistantConversation() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiAxios.get<AssistantConversation>("/api/v1/portal/students/me/assistant");
      return data;
    },
  });
}

export function useSendAssistantMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      const { data } = await apiAxios.post<AssistantConversation>(
        "/api/v1/portal/students/me/assistant/messages",
        { text },
      );
      return data;
    },
    onSuccess: (data) => qc.setQueryData(QUERY_KEY, data),
  });
}
