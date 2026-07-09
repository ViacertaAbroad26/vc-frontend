import { PageHeader } from "@viacerta/ui";

import { PendingStatus } from "@/features/pending/PendingStatus";

export default function PendingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Preparing your assessment" description="This usually takes a few minutes." />
      <PendingStatus />
    </div>
  );
}
