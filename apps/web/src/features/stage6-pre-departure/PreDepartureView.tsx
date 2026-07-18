import { Card, CardBody, ModuleCard, PageHeader } from "@viacerta/ui";

import { CountdownPanel } from "./CountdownPanel";
import { NinetyDayPlanPanel } from "./NinetyDayPlanPanel";
import { RelocationChecklistPanel } from "./RelocationChecklistPanel";
import { useRelocationChecklist } from "./useRelocationChecklist";
import { useRelocationPlan } from "./useRelocationPlan";

export function PreDepartureView() {
  const { data: checklist } = useRelocationChecklist();
  const { data: plan } = useRelocationPlan();

  const checklistDone = checklist != null && checklist.completedCount >= checklist.items.length;
  const planStarted = plan != null && plan.departureAt != null;
  const ninetyDayDone = plan != null && plan.ninetyDayPlan.every((m) => m.status === "done");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage 6 · Pre-Departure"
        description="A confident landing — orientation, banking, healthcare and a structured First 90 Days plan."
      />

      <Card>
        <CardBody>
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">Modules</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <ModuleCard title="Relocation Checklist" status={checklistDone ? "complete" : "available"} />
            <ModuleCard title="Countdown to Departure" status={planStarted ? "complete" : "available"} />
            <ModuleCard title="First 90 Days Plan" status={ninetyDayDone ? "complete" : "available"} />
            <ModuleCard title="Country Orientation" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Packing Checklist" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Airport Guide" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Accommodation" subtitle="Coming soon" status="locked" />
            <ModuleCard title="SIM Card" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Bank Account" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Healthcare" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Networking" subtitle="Coming soon" status="locked" />
            <ModuleCard title="LinkedIn Optimization" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Resume Review" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Job Preparation" subtitle="Coming soon" status="locked" />
          </div>
        </CardBody>
      </Card>

      <CountdownPanel />
      <NinetyDayPlanPanel />
      <RelocationChecklistPanel />
    </div>
  );
}
