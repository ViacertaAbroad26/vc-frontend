import { ApiError } from "@viacerta/api-client";
import { Card, CardBody, ModuleCard, PageHeader, Spinner } from "@viacerta/ui";

import { FinancialPlanPanel } from "./FinancialPlanPanel";
import { useFinancialPlan } from "./useFinancialPlan";
import { useVisaChecklist } from "./useVisaChecklist";
import { useVisaTracker } from "./useVisaTracker";
import { VisaChecklistPanel } from "./VisaChecklistPanel";
import { VisaStatusPanel } from "./VisaStatusPanel";

export function VisaFinanceView() {
  const { data: tracker, isLoading: trackerLoading, error: trackerError } = useVisaTracker();
  const { data: checklist } = useVisaChecklist();
  const { data: plan } = useFinancialPlan();

  const trackerNotReady = trackerError instanceof ApiError && trackerError.status === 422;

  if (trackerLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const checklistDone = checklist != null && checklist.completedCount >= checklist.items.length;
  const planDone = plan != null && plan.totalAmount > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage 5 · Visa & Financial Planning"
        description="Structure funding, secure the permit and prep the interview — loans, forex and insurance in one place."
      />

      <Card>
        <CardBody>
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">Modules</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <ModuleCard title="Financial Planning" status={planDone ? "complete" : "available"} />
            <ModuleCard title="Visa Checklist" status={checklistDone ? "complete" : "available"} />
            <ModuleCard title="Visa Status" status={tracker ? "available" : "locked"} />
            <ModuleCard title="Education Loan" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Scholarship Tracker" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Mock Visa Interview" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Travel Insurance" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Accommodation" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Forex" subtitle="Coming soon" status="locked" />
            <ModuleCard title="Flight Planning" subtitle="Coming soon" status="locked" />
          </div>
        </CardBody>
      </Card>

      <FinancialPlanPanel />

      {tracker ? (
        <VisaStatusPanel tracker={tracker} />
      ) : trackerNotReady ? (
        <Card>
          <CardBody>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Your Visa Status unlocks once your Stage 4 application tracker is confirmed with an accepted offer.
            </p>
          </CardBody>
        </Card>
      ) : null}

      <VisaChecklistPanel />
    </div>
  );
}
