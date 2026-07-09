import { useMutation } from "@tanstack/react-query";
import { apiAxios, BASE_URL, type PresignedUrlResponse } from "@viacerta/api-client";

export function useViewDocument() {
  return useMutation({
    mutationFn: async (documentId: string) => {
      const { data } = await apiAxios.get<PresignedUrlResponse>(
        `/api/v1/portal/students/me/documents/${documentId}/download`,
      );
      const url = data.url.startsWith("/") ? `${BASE_URL}${data.url}` : data.url;
      window.open(url, "_blank", "noopener,noreferrer");
    },
  });
}
