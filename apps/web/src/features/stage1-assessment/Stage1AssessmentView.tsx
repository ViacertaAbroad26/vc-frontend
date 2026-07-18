import { ApiError } from "@viacerta/api-client";
import { Button, Card, CardBody, PageHeader, Spinner } from "@viacerta/ui";
import { routes } from "@viacerta/utils";
import { Link } from "react-router-dom";

import { useStudentReport } from "@/features/report/useStudentReport";

import { AssessmentResults } from "./AssessmentResults";

export function Stage1AssessmentView() {
  const { data: report, isLoading, error } = useStudentReport();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  // 404 = no assessment yet (student hasn't submitted intake, or AI
  // pre-scoring hasn't finished) — not a real error, show the entry state.
  const noAssessmentYet = error instanceof ApiError && error.status === 404;

  if (noAssessmentYet || !report) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Stage 1 · Global Career Assessment"
          description="A deep profile feeding the GCSS engine, risk indicators and an AI summary."
        />
        <Card>
          <CardBody className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              This is a detailed intake — academic background, work history, financials, family
              composition, and immigration history — that powers your Global Career Sustainability
              Score. It takes about 35–45 minutes; your progress is saved as you go.
            </p>
            <Link to={routes.intakeStart}>
              <Button variant="accent">Start the assessment</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!report.publishedAt) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Stage 1 · Global Career Assessment"
          description="Your submission is being scored."
        />
        <Card>
          <CardBody className="flex items-center gap-3">
            <Spinner />
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Your assessment is being pre-scored — this usually takes under a minute. This page
              will update automatically.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return <AssessmentResults report={report} />;
}
