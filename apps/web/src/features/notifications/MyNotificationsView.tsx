import { NotificationsInboxView } from "./NotificationsInboxView";
import { useMarkAllMyNotificationsRead } from "./useMarkAllMyNotificationsRead";
import { useMarkMyNotificationRead } from "./useMarkMyNotificationRead";
import { useMyNotifications } from "./useMyNotifications";

export function MyNotificationsView() {
  const { data, isLoading, error } = useMyNotifications();
  const markRead = useMarkMyNotificationRead();
  const markAllRead = useMarkAllMyNotificationsRead();

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
