import { useQuery } from "@tanstack/react-query";
import { apiAxios, type DocumentQueueResponse } from "@viacerta/api-client";

export function usePendingDocuments() {
  return useQuery({
    queryKey: ["internal", "documents", "pending"],
    queryFn: async () => {
      const { data } = await apiAxios.get<DocumentQueueResponse>("/api/v1/internal/documents", {
        params: { limit: 50 },
      });
      return data;
    },
  });
}
