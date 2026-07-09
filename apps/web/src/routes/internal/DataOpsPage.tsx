import { PageHeader } from "@viacerta/ui";

import { DataOpsView } from "@/features/data-ops/DataOpsView";

export default function DataOpsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Data ops" description="Data quality and pipeline operations." />
      <DataOpsView />
    </div>
  );
}
