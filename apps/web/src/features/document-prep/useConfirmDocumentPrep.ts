import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiAxios,
  type ConfirmDocumentPrepRequest,
  type DocumentPrepResponse,
} from "@viacerta/api-client";

export function useConfirmDocumentPrep(studentId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: ConfirmDocumentPrepRequest) => {
      const { data } = await apiAxios.post<DocumentPrepResponse>(
        `/api/v1/advisor/students/${studentId}/document-prep/confirm`,
        body,
      );
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["advisor", "document-prep", studentId], data);
      void qc.invalidateQueries({ queryKey: ["advisor", "student", studentId] });
      void qc.invalidateQueries({ queryKey: ["advisor", "cases"] });
    },
  });
}
