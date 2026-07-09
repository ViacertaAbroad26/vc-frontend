import { useQuery } from "@tanstack/react-query";
import { apiAxios, type DocumentListResponse } from "@viacerta/api-client";

export function useStudentCaseDocuments(studentId: string) {
  return useQuery({
    queryKey: ["advisor", "students", studentId, "documents"],
    queryFn: async () => {
      const { data } = await apiAxios.get<DocumentListResponse>(`/api/v1/advisor/students/${studentId}/documents`);
      return data.documents;
    },
  });
}
