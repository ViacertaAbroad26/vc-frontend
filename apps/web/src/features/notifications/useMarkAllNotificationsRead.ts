import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type MarkAllReadResponse } from "@viacerta/api-client";

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.post<MarkAllReadResponse>("/api/v1/advisor/notifications/mark-all-read");
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["advisor", "notifications"] });
    },
  });
}
