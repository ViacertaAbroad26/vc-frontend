import { Card, CardBody } from "@viacerta/ui";
import { CheckCircle2, Circle } from "lucide-react";

import { useSaveVisaChecklist, useVisaChecklist } from "./useVisaChecklist";

export function VisaChecklistPanel() {
  const { data: checklist, isLoading } = useVisaChecklist();
  const saveChecklist = useSaveVisaChecklist();

  if (isLoading || !checklist) return null;

  const toggle = (key: string) => {
    const items = checklist.items.map((i) => (i.key === key ? { ...i, done: !i.done } : i));
    saveChecklist.mutate({ items });
  };

  return (
    <Card>
      <CardBody>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Visa Checklist</h3>
          <span className="rounded-full bg-mint-50 px-2.5 py-0.5 text-xs font-semibold text-mint-700 dark:bg-navy-700 dark:text-mint-400">
            {checklist.completedCount}/{checklist.items.length}
          </span>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-navy-700">
          {checklist.items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => toggle(item.key)}
              className="flex w-full items-center justify-between py-2.5 text-left"
            >
              <div className="flex items-center gap-2.5">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-mint-500" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-gray-50">{item.label}</span>
              </div>
              {item.statusNote && (
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.statusNote}</span>
              )}
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
