import { cn } from "@viacerta/ui";

import { STAGE_TIMELINE, stageNumberForState } from "@/lib/journey-stages";

export function StageTracker({ currentState }: { currentState: string }) {
  const current = stageNumberForState(currentState);

  return (
    <ol className="flex flex-wrap gap-2" aria-label="Student stage progress">
      {STAGE_TIMELINE.map((s) => {
        const status = s.stage < current ? "done" : s.stage === current ? "current" : "upcoming";
        return (
          <li
            key={s.stage}
            aria-current={status === "current" ? "step" : undefined}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
              status === "done" && "bg-green-50 text-green-700",
              status === "current" && "bg-navy-600 text-white",
              status === "upcoming" && "bg-gray-100 text-gray-500",
            )}
          >
            <span>{s.stage}</span>
            <span>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
