import { PageHeader } from "@viacerta/ui";

import { CaseQueue } from "@/features/cases/CaseQueue";

export default function CaseQueuePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Case queue" description="Students awaiting review." />
      <CaseQueue />
    </div>
  );
}
