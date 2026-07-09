import type { StudentJourney } from "@viacerta/api-client";
import { cn } from "@viacerta/ui";

const STATUS_DOT: Record<string, string> = {
  COMPLETE: "bg-emerald-500",
  IN_PROGRESS: "bg-navy-600",
  PENDING: "bg-gray-300",
};

const STATUS_LABEL: Record<string, string> = {
  COMPLETE: "Complete",
  IN_PROGRESS: "In progress",
  PENDING: "Not started",
};

export function JourneyTimeline({ stages }: { stages: StudentJourney["stages"] }) {
  return (
    <ol className="space-y-4">
      {stages.map((stage) => (
        <li key={stage.stage} className="flex items-start gap-3">
          <span
            className={cn("mt-1.5 h-3 w-3 shrink-0 rounded-full", STATUS_DOT[stage.status] ?? "bg-gray-300")}
            aria-hidden
          />
          <div>
            <p className="text-sm font-medium text-gray-900">
              Stage {stage.stage} · {stage.name}
            </p>
            <p className="text-xs text-gray-500">{STATUS_LABEL[stage.status] ?? stage.status}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
