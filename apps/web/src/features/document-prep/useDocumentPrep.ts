import { useQuery } from "@tanstack/react-query";
import { apiAxios, type DocumentPrepResponse } from "@viacerta/api-client";

export function useDocumentPrep(studentId: string) {
  return useQuery({
    queryKey: ["advisor", "document-prep", studentId],
    queryFn: async () => {
      const { data } = await apiAxios.get<DocumentPrepResponse>(
        `/api/v1/advisor/students/${studentId}/document-prep`,
      );
      return data;
    },
  });
}
