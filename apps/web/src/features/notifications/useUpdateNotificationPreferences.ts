import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiAxios,
  type NotificationPreferencesResponse,
  type UpdateNotificationPreferencesRequest,
} from "@viacerta/api-client";

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateNotificationPreferencesRequest) => {
      const { data } = await apiAxios.patch<NotificationPreferencesResponse>(
        "/api/v1/advisor/notification-preferences",
        body,
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["advisor", "notification-preferences"] });
    },
  });
}
