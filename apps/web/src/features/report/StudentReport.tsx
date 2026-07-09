import { ApiError } from "@viacerta/api-client";
import { AsyncBoundary, Button, EmptyState, ErrorState, ReportDisclaimer } from "@viacerta/ui";
import { Download } from "lucide-react";

import { MyDisputesSection } from "@/features/disputes/MyDisputesSection";

import {
  GcriSection,
  GcssSection,
  InsightsSection,
  NinetyDayPlanSection,
  ParentSummarySection,
  RiskRegisterSection,
} from "./ReportSections";
import { useReportPdf } from "./useReportPdf";
import { useStudentReport } from "./useStudentReport";

export function StudentReport() {
  const { data, isLoading, error } = useStudentReport();
  const pdf = useReportPdf();

  return (
    <AsyncBoundary
      isLoading={isLoading}
      error={error}
      data={data}
      errorFallback={(err) =>
        err instanceof ApiError && err.status === 404 ? (
          <EmptyState
            title="Your report is being prepared"
            description="Your advisor is finishing up your assessment report. This page will update automatically once it's ready."
          />
        ) : (
          <ErrorState error={err} />
        )
      }
    >
      {(report) => (
        <div className="space-y-8">
          {report.publishedAt && (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Published {new Date(report.publishedAt).toLocaleDateString()}
              </p>
              <Button variant="outline" loading={pdf.isPending} onClick={() => pdf.mutate()}>
                <Download className="mr-2 h-4 w-4" aria-hidden />
                Download PDF
              </Button>
            </div>
          )}

          <GcssSection gcss={report.gcss} />
          <GcriSection gcri={report.gcri} />
          <InsightsSection insights={report.advisorInsights} />
          <NinetyDayPlanSection plan={report.ninetyDayPlan} />
          <RiskRegisterSection items={report.riskRegister} />
          <ParentSummarySection summary={report.parentSummary} />

          <MyDisputesSection assessmentId={report.assessmentId} />

          <ReportDisclaimer />
        </div>
      )}
    </AsyncBoundary>
  );
}
