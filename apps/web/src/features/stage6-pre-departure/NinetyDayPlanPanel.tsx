import { Card, CardBody } from "@viacerta/ui";
import { CheckCircle2, Clock, Lock } from "lucide-react";

import { useRelocationPlan, useSaveMilestones } from "./useRelocationPlan";

export function NinetyDayPlanPanel() {
  const { data: plan, isLoading } = useRelocationPlan();
  const saveMilestones = useSaveMilestones();

  if (isLoading || !plan) return null;

  const markCurrentDone = () => {
    const items = plan.ninetyDayPlan.map((m) => ({
      phase: m.phase,
      description: m.description,
      done: m.status === "done" || m.status === "current",
    }));
    saveMilestones.mutate({ items });
  };

  return (
    <Card>
      <CardBody>
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">First 90 Days Plan</h3>
        <div className="divide-y divide-gray-100 dark:divide-navy-700">
          {plan.ninetyDayPlan.map((m) => (
            <button
              key={m.phase}
              type="button"
              disabled={m.status !== "current"}
              onClick={markCurrentDone}
              className="flex w-full items-start gap-3 py-3 text-left disabled:cursor-default"
            >
              <span
                className={
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg " +
                  (m.status === "done"
                    ? "bg-mint-400 text-navy-900"
                    : m.status === "current"
                      ? "bg-navy-700 text-white dark:bg-mint-400 dark:text-navy-900"
                      : "bg-gray-100 text-gray-400 dark:bg-navy-700 dark:text-gray-500")
                }
              >
                {m.status === "done" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : m.status === "current" ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {m.phase}
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-50">{m.description}</p>
              </div>
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
