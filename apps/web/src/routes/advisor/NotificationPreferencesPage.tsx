import { PageHeader } from "@viacerta/ui";

import { AdvisorNotificationPreferencesView } from "@/features/notifications/AdvisorNotificationPreferencesView";

export default function NotificationPreferencesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Notification preferences" description="Choose how you want to be notified about case updates." />
      <AdvisorNotificationPreferencesView />
    </div>
  );
}
