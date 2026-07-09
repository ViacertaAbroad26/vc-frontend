import { AsyncBoundary, Button, Card, CardBody } from "@viacerta/ui";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

import { useJourney } from "@/features/journey/use-journey";

const STAGE_LABELS: Record<string, string> = {
  INTAKE_COMPLETE: "AI is pre-scoring your assessment",
  AI_PRESCORED: "Waiting for your advisor to review",
  SESSION1_BOOKED: "Session 1 is booked with your advisor",
  GCSS_CONFIRMED: "Score confirmed — preparing your country-risk analysis",
  GAP_LOOP: "Working through your gap-closure plan",
  GCRI_RUN: "Running your country-risk analysis",
  REPORT_BUILT: "Your report is ready",
};

export function PendingStatus() {
  const { data, isLoading, error } = useJourney();

  return (
    <AsyncBoundary isLoading={isLoading} error={error} data={data}>
      {(journey) => {
        const label = STAGE_LABELS[journey.currentState] ?? "We're processing your assessment";
        const ready = journey.currentState === "REPORT_BUILT";

        return (
          <Card>
            <CardBody className="flex flex-col items-center gap-4 py-12 text-center">
              {ready ? null : <Loader2 className="h-10 w-10 animate-spin text-navy-600" aria-hidden />}
              <div>
                <h2 className="text-xl font-medium text-gray-900">{label}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  We&apos;ll email you when there&apos;s an update. You can leave this page.
                </p>
                {journey.advisorName && (
                  <p className="mt-3 text-sm text-navy-700">
                    Your advisor <span className="font-medium">{journey.advisorName}</span> will assist you.
                  </p>
                )}
              </div>
              {ready && (
                <Link to="/report">
                  <Button>View report</Button>
                </Link>
              )}
            </CardBody>
          </Card>
        );
      }}
    </AsyncBoundary>
  );
}
