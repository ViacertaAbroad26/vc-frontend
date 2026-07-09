import { AsyncBoundary, Card, CardBody, PageHeader } from "@viacerta/ui";
import { Link } from "react-router-dom";

import { NextActionCard } from "@/features/journey/NextActionCard";
import { useJourney } from "@/features/journey/use-journey";

export default function DashboardPage() {
  const { data, isLoading, error } = useJourney();

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Track your application journey and next steps." />
      <AsyncBoundary isLoading={isLoading} error={error} data={data}>
        {(journey) => (
          <div className="space-y-6">
            <NextActionCard journey={journey} />
            <Card>
              <CardBody>
                <p className="text-sm text-gray-500">Current stage</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  Stage {journey.currentStage} · {journey.stages[journey.currentStage - 1]?.name}
                </p>
                <Link to="/journey" className="mt-3 inline-block text-sm text-navy-700 underline">
                  View full journey
                </Link>
              </CardBody>
            </Card>
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}
