import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type NotificationItem } from "@viacerta/api-client";

export function useMarkNotificationRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await apiAxios.patch<NotificationItem>(`/api/v1/advisor/notifications/${notificationId}/read`);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["advisor", "notifications"] });
    },
  });
}
