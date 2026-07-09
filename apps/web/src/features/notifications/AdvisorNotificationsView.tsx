import { NotificationsInboxView } from "./NotificationsInboxView";
import { useMarkAllNotificationsRead } from "./useMarkAllNotificationsRead";
import { useMarkNotificationRead } from "./useMarkNotificationRead";
import { useNotifications } from "./useNotifications";

export function AdvisorNotificationsView() {
  const { data, isLoading, error } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <NotificationsInboxView
      data={data}
      isLoading={isLoading}
      error={error}
      onMarkRead={(id) => markRead.mutate(id)}
      onMarkAllRead={() => markAllRead.mutate()}
      isMarkingAllRead={markAllRead.isPending}
    />
  );
}
