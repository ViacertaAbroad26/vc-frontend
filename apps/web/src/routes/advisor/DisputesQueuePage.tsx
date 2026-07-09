import { PageHeader } from "@viacerta/ui";

import { DisputesQueueView } from "@/features/disputes/DisputesQueueView";

export default function DisputesQueuePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Disputes" description="Resolve assessment score disputes within 5 business days." />
      <DisputesQueueView />
    </div>
  );
}
