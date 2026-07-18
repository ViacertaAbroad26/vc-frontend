import { useQuery } from "@tanstack/react-query";
import { apiAxios, type ApiComponents } from "@viacerta/api-client";

export type StudentDocumentPrep = ApiComponents["schemas"]["StudentDocumentPrepResponse"];

export function useDocumentPrep() {
  return useQuery({
    queryKey: ["studentDocumentPrep"],
    queryFn: async () => {
      const { data } = await apiAxios.get<StudentDocumentPrep>("/api/v1/portal/students/me/document-prep");
      return data;
    },
  });
}
