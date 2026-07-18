import { Check, Lock } from "lucide-react";

import { cn } from "../lib/cn";

export type StageNodeStatus = "done" | "current" | "locked";

type StageNodeProps = {
  status: StageNodeStatus;
  index: number;
  label: string;
  className?: string;
};

export function StageNode({ status, index, label, className }: StageNodeProps) {
  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
          status === "done" && "border-mint-400 bg-mint-400 text-navy-900",
          status === "current" && "border-navy-700 bg-navy-700 text-white dark:border-mint-400 dark:bg-mint-400 dark:text-navy-900",
          status === "locked" &&
            "border-gray-200 bg-white text-gray-400 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-500",
        )}
      >
        {status === "done" ? (
          <Check className="h-4 w-4" aria-hidden />
        ) : status === "locked" ? (
          <Lock className="h-3.5 w-3.5" aria-hidden />
        ) : (
          index
        )}
      </div>
      <span
        className={cn(
          "max-w-[5.5rem] text-center text-[11px] font-medium leading-tight",
          status === "locked" ? "text-gray-400 dark:text-gray-500" : "text-gray-700 dark:text-gray-200",
        )}
      >
        {label}
      </span>
    </div>
  );
}

export type StageRailItem = {
  label: string;
  status: StageNodeStatus;
};

export function StageRail({ items, className }: { items: StageRailItem[]; className?: string }) {
  return (
    <div className={cn("flex items-start", className)}>
      {items.map((item, i) => (
        <div key={item.label} className="flex flex-1 items-start last:flex-initial">
          <StageNode status={item.status} index={i + 1} label={item.label} />
          {i < items.length - 1 && (
            <div
              className={cn(
                "mt-[18px] h-0.5 flex-1",
                items[i + 1]?.status !== "locked" || item.status === "done"
                  ? "bg-mint-400"
                  : "bg-gray-200 dark:bg-navy-700",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
