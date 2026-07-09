import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiAxios,
  type DocumentPrepResponse,
  type UpdateDocumentPrepRequest,
} from "@viacerta/api-client";

export function useUpdateDocumentPrep(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateDocumentPrepRequest) => {
      const { data } = await apiAxios.patch<DocumentPrepResponse>(
        `/api/v1/advisor/students/${studentId}/document-prep`,
        body,
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["advisor", "document-prep", studentId], data);
    },
  });
}
