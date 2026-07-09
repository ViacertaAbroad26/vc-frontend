import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type DocumentResponse, type DocumentType } from "@viacerta/api-client";

export function useUploadDocument() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, file }: { type: DocumentType; file: File }) => {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("file", file);
      const { data } = await apiAxios.post<DocumentResponse>("/api/v1/portal/students/me/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      qc.invalidateQueries({ queryKey: ["journey"] });
    },
  });
}
