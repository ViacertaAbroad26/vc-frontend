import { ApiError } from "@viacerta/api-client";
import { Card, CardBody, ModuleCard, PageHeader, Spinner } from "@viacerta/ui";

import { ApplicationTrackerPanel } from "./ApplicationTrackerPanel";
import { DocumentChecklistPanel } from "./DocumentChecklistPanel";
import { EssayReviewPanel } from "./EssayReviewPanel";
import { LorTrackerPanel } from "./LorTrackerPanel";
import { useApplicationTracker } from "./useApplicationTracker";
import { useDocumentPrep } from "./useDocumentPrep";
import { useEssay } from "./useEssay";
import { useLorTracker } from "./useLorTracker";

export function ApplicationExecutionView() {
  const { data: prep, isLoading: prepLoading } = useDocumentPrep();
  const { data: tracker, isLoading: trackerLoading, error: trackerError } = useApplicationTracker();
  const { data: essay } = useEssay();
  const { data: lorTracker } = useLorTracker();

  const trackerNotReady = trackerError instanceof ApiError && trackerError.status === 422;

  if (prepLoading || trackerLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const prepDone = prep && prep.items.length > 0 && prep.items.every((i) => i.documentStatus === "VERIFIED");
  const essayDone = Boolean(essay?.lastReview);
  const lorDone = lorTracker != null && lorTracker.completedCount >= lorTracker.requiredCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage 4 · Application Execution"
        description="Build and track every application — CV, SOP, LOR — with AI review and originality scoring."
      />

      <Card>
        <CardBody>
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">Modules</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <ModuleCard title="Document Checklist" status={prepDone ? "complete" : "available"} />
            <ModuleCard title="Application Tracker" status={tracker ? "available" : "locked"} />
            <ModuleCard title="Essay Review (AI)" status={essayDone ? "complete" : "available"} />
            <ModuleCard title="Originality Score" status={essayDone ? "complete" : "available"} />
            <ModuleCard title="Letters of Recommendation" status={lorDone ? "complete" : "available"} />
            <ModuleCard title="CV & Resume" subtitle="Managed in Documents" status="available" />
          </div>
        </CardBody>
      </Card>

      {prep && <DocumentChecklistPanel prep={prep} />}

      {tracker ? (
        <ApplicationTrackerPanel tracker={tracker} />
      ) : trackerNotReady ? (
        <Card>
          <CardBody>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Your Application Tracker unlocks once your Stage 3 university shortlist is confirmed.
            </p>
          </CardBody>
        </Card>
      ) : null}

      <EssayReviewPanel />
      <LorTrackerPanel />
    </div>
  );
}
