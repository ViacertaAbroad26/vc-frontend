import { NotificationPreferencesView } from "./NotificationPreferencesView";
import { useNotificationPreferences } from "./useNotificationPreferences";
import { useUpdateNotificationPreferences } from "./useUpdateNotificationPreferences";

export function AdvisorNotificationPreferencesView() {
  const { data, isLoading, error } = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();

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
