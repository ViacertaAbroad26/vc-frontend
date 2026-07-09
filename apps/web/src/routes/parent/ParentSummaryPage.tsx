import type { GcssFlag } from "@viacerta/design-tokens";
import { AsyncBoundary, Card, CardBody, GcssFlagBadge, PageHeader, ScoreGauge } from "@viacerta/ui";
import { useParams } from "react-router-dom";

import { useParentSummary } from "@/features/parent/useParentSummary";

const TOTAL_STAGES = 7;

export default function ParentSummaryPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const { data, isLoading, error } = useParentSummary(studentId ?? "");

  return (
    <div className="space-y-6">
      <PageHeader title="Student summary" description="A high-level view of your student's progress." />

      <AsyncBoundary isLoading={isLoading} error={error} data={data}>
        {(summary) => {
          const flag = summary.gcssFlag as GcssFlag;
          return (
            <div className="space-y-4">
              <Card>
                <CardBody className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
                  {typeof summary.gcssScore === "number" ? (
                    <ScoreGauge score={summary.gcssScore} flag={flag} label="Readiness" />
                  ) : (
                    <div className="text-sm text-gray-500">No score yet</div>
                  )}
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-semibold text-gray-900">{summary.studentName}</h2>
                      <GcssFlagBadge flag={flag} />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Stage {summary.currentStage} of {TOTAL_STAGES}
                    </p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Cost</h3>
                    <p className="mt-1 text-sm text-gray-700">{summary.parentSummary.cost}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Safety</h3>
                    <p className="mt-1 text-sm text-gray-700">{summary.parentSummary.safety}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Timeline</h3>
                    <p className="mt-1 text-sm text-gray-700">{summary.parentSummary.timeline}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">ROI</h3>
                    <p className="mt-1 text-sm text-gray-700">{summary.parentSummary.roi}</p>
                  </div>
                </CardBody>
              </Card>

              <p className="text-xs text-gray-500">{summary.disclaimer}</p>
            </div>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
