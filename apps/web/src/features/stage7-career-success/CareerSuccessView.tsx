import { Card, CardBody, ModuleCard, PageHeader } from "@viacerta/ui";

import { OfferTrackerPanel } from "./OfferTrackerPanel";
import { PlacementProbabilityPanel } from "./PlacementProbabilityPanel";
import { useCareerSuccess } from "./useCareerSuccess";

export function CareerSuccessView() {
  const { data: careerSuccess } = useCareerSuccess();

  const signalsDone = careerSuccess != null && careerSuccess.resumeScore != null && careerSuccess.linkedinScore != null;
  const hasOffers = careerSuccess != null && (careerSuccess.offers ?? []).length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage 7 · Global Career Success"
        description="The payoff — coaching, recruiter connections, a live job board and offer tracking."
      />

      <Card>
        <CardBody>
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">Modules</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <ModuleCard title="Resume Score" status={signalsDone ? "complete" : "available"} />
            <ModuleCard title="LinkedIn Score" status={signalsDone ? "complete" : "available"} />
            <ModuleCard title="Offer Tracker" status={hasOffers ? "complete" : "available"} />
            <ModuleCard title="Career Coach" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Portfolio Review" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Mock Interviews" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Interview Feedback" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Networking Tasks" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Recruiter Connect" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Job Board" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Application Tracker" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Salary Benchmark" subtitle="Coming soon" status="locked" />
          </div>
        </CardBody>
      </Card>

      <PlacementProbabilityPanel />
      <OfferTrackerPanel />
    </div>
  );
}
