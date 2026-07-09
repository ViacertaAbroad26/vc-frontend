import { PageHeader } from "@viacerta/ui";

import { OrganizationsView } from "@/features/organizations/OrganizationsView";

export default function OrganizationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Branches" description="Manage organizations / branches for multi-tenant scoping." />
      <OrganizationsView />
    </div>
  );
}
