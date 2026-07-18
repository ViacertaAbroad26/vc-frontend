import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export type EmptyStateProps = {
  title?: string;
  description?: string | undefined;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title = "Nothing here yet",
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 px-6 py-12 text-center dark:border-navy-700",
        className,
      )}
    >
      <div className="text-gray-400 dark:text-gray-500">{icon ?? <Inbox className="h-8 w-8" aria-hidden />}</div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{title}</p>
        {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
