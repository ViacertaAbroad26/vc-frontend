import { NotificationPreferencesView } from "./NotificationPreferencesView";
import { useMyNotificationPreferences } from "./useMyNotificationPreferences";
import { useUpdateMyNotificationPreferences } from "./useUpdateMyNotificationPreferences";

export function MyNotificationPreferencesView() {
  const { data, isLoading, error } = useMyNotificationPreferences();
  const update = useUpdateMyNotificationPreferences();

  return (
    <NotificationPreferencesView
      data={data}
      isLoading={isLoading}
      error={error}
      onSave={(preferences) => update.mutate({ preferences })}
      isSaving={update.isPending}
    />
  );
}
