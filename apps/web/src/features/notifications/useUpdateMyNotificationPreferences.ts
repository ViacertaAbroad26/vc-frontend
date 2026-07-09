import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiAxios,
  type NotificationPreferencesResponse,
  type UpdateNotificationPreferencesRequest,
} from "@viacerta/api-client";

export function useUpdateMyNotificationPreferences() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateNotificationPreferencesRequest) => {
      const { data } = await apiAxios.patch<NotificationPreferencesResponse>(
        "/api/v1/portal/students/me/notification-preferences",
        body,
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["portal", "notification-preferences"] });
    },
  });
}
