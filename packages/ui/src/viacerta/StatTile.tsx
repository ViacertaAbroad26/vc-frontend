import type { LucideIcon } from "lucide-react";

import { cn } from "../lib/cn";

type StatTileProps = {
  icon?: LucideIcon;
  label: string;
  value: string;
  delta?: string; // e.g. "+6 this month"
  className?: string;
};

export function StatTile({ icon: Icon, label, value, delta, className }: StatTileProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-4",
        "dark:border-navy-700 dark:bg-navy-800",
        className,
      )}
    >
      {Icon && (
        <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-mint-50 text-navy-700 dark:bg-navy-700 dark:text-mint-400">
          <Icon className="h-4 w-4" />
        </span>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-0.5 text-2xl font-bold text-gray-900 dark:text-gray-50">{value}</p>
      {delta && <p className="mt-0.5 text-xs text-mint-600 dark:text-mint-400">{delta}</p>}
    </div>
  );
}
