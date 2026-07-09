import { useQuery } from "@tanstack/react-query";
import { apiAxios, type NotificationPreferencesResponse } from "@viacerta/api-client";

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["advisor", "notification-preferences"],
    queryFn: async () => {
      const { data } = await apiAxios.get<NotificationPreferencesResponse>(
        "/api/v1/advisor/notification-preferences",
      );
      return data;
    },
  });
}
