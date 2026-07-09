import { useMutation } from "@tanstack/react-query";
import { apiAxios, BASE_URL, type PresignedUrlResponse } from "@viacerta/api-client";

export function useReportPdf() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.get<PresignedUrlResponse>("/api/v1/portal/students/me/report/pdf");
      return data;
    },
    onSuccess: (data) => {
      // In local-storage dev mode the API returns a relative `/files/...` path
      // served by the backend, not the frontend dev server.
      const url = data.url.startsWith("/") ? `${BASE_URL}${data.url}` : data.url;
      window.open(url, "_blank", "noopener,noreferrer");
    },
  });
}
