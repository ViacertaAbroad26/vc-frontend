import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type DocumentOpsResponse, type EvidenceLevel } from "@viacerta/api-client";

export function useVerifyDocument() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, evidenceLevel }: { documentId: string; evidenceLevel: EvidenceLevel }) => {
      const { data } = await apiAxios.post<DocumentOpsResponse>(
        `/api/v1/internal/documents/${documentId}/verify`,
        { evidenceLevel },
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["internal", "documents", "pending"] });
    },
  });
}
