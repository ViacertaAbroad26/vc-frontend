import { Card, CardBody } from "@viacerta/ui";
import { CheckCircle2, Circle } from "lucide-react";

import { useRelocationChecklist } from "./useRelocationChecklist";

const TASK_LABELS: Record<string, string> = {
  FLIGHT_BOOKED: "Flight booked",
  ACCOMMODATION_ARRANGED: "Accommodation arranged",
  ORIENTATION_ATTENDED: "Orientation attended",
  INSURANCE_PURCHASED: "Travel insurance",
  FOREX_ARRANGED: "Forex arranged",
  SIM_ARRANGED: "SIM & connectivity",
};

export function RelocationChecklistPanel() {
  const { data: checklist, isLoading } = useRelocationChecklist();

  if (isLoading || !checklist) return null;

  return (
    <Card>
      <CardBody>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Relocation Checklist</h3>
          <span className="rounded-full bg-mint-50 px-2.5 py-0.5 text-xs font-semibold text-mint-700 dark:bg-navy-700 dark:text-mint-400">
            {checklist.completedCount}/{checklist.items.length}
          </span>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-navy-700">
          {checklist.items.map((item) => (
            <div key={item.task} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-mint-500" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  {TASK_LABELS[item.task] ?? item.task}
                </span>
              </div>
              {item.notes && <span className="text-xs text-gray-500 dark:text-gray-400">{item.notes}</span>}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
