import { Card, CardBody, Chip, StageRail, type StageNodeStatus } from "@viacerta/ui";

import { isoToFlag } from "@/features/stage2-strategy/iso-to-flag";

import type { StudentVisaTracker } from "./useVisaTracker";

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "Not Started",
  DOCUMENTS_SUBMITTED: "In Progress",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function VisaStatusPanel({ tracker }: { tracker: StudentVisaTracker }) {
  return (
    <Card>
      <CardBody>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            Visa Status · Study Permit ({isoToFlag(tracker.country)} {tracker.country})
          </h3>
          <Chip>{STATUS_LABELS[tracker.visaStatus] ?? tracker.visaStatus}</Chip>
        </div>
        <StageRail
          items={tracker.pipeline.map((step) => ({
            label: step.label,
            status: step.status as StageNodeStatus,
          }))}
        />
      </CardBody>
    </Card>
  );
}
