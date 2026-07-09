import { useQuery } from "@tanstack/react-query";
import { apiAxios, type NotificationListResponse } from "@viacerta/api-client";

export function useMyNotifications() {
  return useQuery({
    queryKey: ["portal", "notifications"],
    queryFn: async () => {
      const { data } = await apiAxios.get<NotificationListResponse>("/api/v1/portal/students/me/notifications");
      return data;
    },
  });
}
