import { AsyncBoundary, PageHeader } from "@viacerta/ui";

import { JourneyTimeline } from "@/features/journey/JourneyTimeline";
import { NextActionCard } from "@/features/journey/NextActionCard";
import { useJourney } from "@/features/journey/use-journey";

export default function JourneyPage() {
  const { data, isLoading, error } = useJourney();

  return (
    <div className="space-y-6">
      <PageHeader title="Your journey" description="See where you are in the process." />
      <AsyncBoundary isLoading={isLoading} error={error} data={data}>
        {(journey) => (
          <div className="space-y-6">
            <NextActionCard journey={journey} />
            <JourneyTimeline stages={journey.stages} />
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}
