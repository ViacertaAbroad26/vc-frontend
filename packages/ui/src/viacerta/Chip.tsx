import type { LucideIcon } from "lucide-react";
import type { PropsWithChildren } from "react";

import { cn } from "../lib/cn";

type ChipProps = PropsWithChildren<{
  icon?: LucideIcon;
  className?: string;
}>;

export function Chip({ icon: Icon, children, className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700",
        "dark:border-navy-700 dark:bg-navy-800 dark:text-gray-200",
        className,
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}
