import { PageHeader } from "@viacerta/ui";

import { AdminOverview } from "@/features/admin/AdminOverview";

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Admin overview" description="Cross-branch summary of students, staff, and GCSS readiness." />
      <AdminOverview />
    </div>
  );
}
