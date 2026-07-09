import { Button, PageHeader } from "@viacerta/ui";
import { routes } from "@viacerta/utils";
import { Link } from "react-router-dom";

import { MyNotificationsView } from "@/features/notifications/MyNotificationsView";

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Notifications"
        description="Updates about your application journey."
        actions={
          <Button variant="secondary" size="sm" asChild>
            <Link to={routes.notificationPreferences}>Preferences</Link>
          </Button>
        }
      />
      <MyNotificationsView />
    </div>
  );
}
