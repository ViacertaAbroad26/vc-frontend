import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type NotificationItem } from "@viacerta/api-client";

export function useMarkMyNotificationRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await apiAxios.patch<NotificationItem>(
        `/api/v1/portal/students/me/notifications/${notificationId}/read`,
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["portal", "notifications"] });
    },
  });
}
