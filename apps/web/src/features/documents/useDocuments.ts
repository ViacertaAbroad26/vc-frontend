import { useQuery } from "@tanstack/react-query";
import { apiAxios, type ApiComponents } from "@viacerta/api-client";

type DocumentListResponse = ApiComponents["schemas"]["DocumentListResponse"];

export function useDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data } = await apiAxios.get<DocumentListResponse>("/api/v1/portal/students/me/documents");
      return data.documents;
    },
  });
}
