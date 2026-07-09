import { PageHeader } from "@viacerta/ui";

import { DecisionForm } from "@/features/decision/DecisionForm";

export default function DecisionGatePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Make your decision"
        description="After reviewing your report, choose how you'd like to proceed."
      />
      <DecisionForm />
    </div>
  );
}
