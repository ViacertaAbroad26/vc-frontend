import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type MarkAllReadResponse } from "@viacerta/api-client";

export function useMarkAllMyNotificationsRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.post<MarkAllReadResponse>(
        "/api/v1/portal/students/me/notifications/mark-all-read",
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["portal", "notifications"] });
    },
  });
}
