import { useQuery } from "@tanstack/react-query";
import { apiAxios, type NotificationListResponse } from "@viacerta/api-client";

export function useNotifications() {
  return useQuery({
    queryKey: ["advisor", "notifications"],
    queryFn: async () => {
      const { data } = await apiAxios.get<NotificationListResponse>("/api/v1/advisor/notifications");
      return data;
    },
  });
}
