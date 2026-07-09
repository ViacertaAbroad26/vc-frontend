import { useQuery } from "@tanstack/react-query";
import { apiAxios, type NotificationPreferencesResponse } from "@viacerta/api-client";

export function useMyNotificationPreferences() {
  return useQuery({
    queryKey: ["portal", "notification-preferences"],
    queryFn: async () => {
      const { data } = await apiAxios.get<NotificationPreferencesResponse>(
        "/api/v1/portal/students/me/notification-preferences",
      );
      return data;
    },
  });
}
