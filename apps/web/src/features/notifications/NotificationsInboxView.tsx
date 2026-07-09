import { type NotificationListResponse } from "@viacerta/api-client";
import { AsyncBoundary, Badge, Button, Card, CardBody, EmptyState } from "@viacerta/ui";
import { formatRelativeTime } from "@viacerta/utils";

type Props = {
  data: NotificationListResponse | undefined;
  isLoading: boolean;
  error: unknown;
  onMarkRead: (notificationId: string) => void;
  onMarkAllRead: () => void;
  isMarkingAllRead?: boolean;
};

export function NotificationsInboxView({ data, isLoading, error, onMarkRead, onMarkAllRead, isMarkingAllRead }: Props) {
  return (
    <AsyncBoundary
      isLoading={isLoading}
      error={error}
      data={data}
      isEmpty={(d) => d.items.length === 0}
      emptyFallback={<EmptyState title="No notifications yet" description="We'll let you know when there's something new." />}
    >
      {(inbox) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {inbox.unreadCount > 0 ? `${inbox.unreadCount} unread` : "All caught up"}
            </p>
            {inbox.unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onMarkAllRead} disabled={isMarkingAllRead}>
                Mark all as read
              </Button>
            )}
          </div>
          <ul className="space-y-3">
            {inbox.items.map((item) => (
              <li key={item.id}>
                <Card className={item.readAt ? undefined : "border-navy-200 bg-navy-50/40"}>
                  <CardBody className="space-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      {!item.readAt && <Badge variant="navy">New</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">{item.body}</p>
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-xs text-gray-400">{formatRelativeTime(item.createdAt)}</p>
                      {!item.readAt && (
                        <Button variant="ghost" size="sm" onClick={() => onMarkRead(item.id)}>
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AsyncBoundary>
  );
}
