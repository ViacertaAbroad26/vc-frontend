import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type DocumentOpsResponse } from "@viacerta/api-client";

export function useRejectStudentDocument(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, reason }: { documentId: string; reason: string }) => {
      const { data } = await apiAxios.post<DocumentOpsResponse>(
        `/api/v1/advisor/students/${studentId}/documents/${documentId}/reject`,
        { reason },
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["advisor", "students", studentId, "documents"] });
    },
  });
}
