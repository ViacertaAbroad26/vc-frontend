import type { ReactNode } from "react";

import { cn } from "../lib/cn";

type ListRowProps = {
  title: string;
  subtitle?: string | undefined;
  trailing?: ReactNode;
  onClick?: () => void;
  className?: string;
};

export function ListRow({ title, subtitle, trailing, onClick, className }: ListRowProps) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      type={onClick ? "button" : undefined}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left",
        onClick && "transition-colors hover:bg-gray-50 dark:hover:bg-navy-700",
        className,
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-50">{title}</span>
        {subtitle && (
          <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{subtitle}</span>
        )}
      </span>
      {trailing && <span className="shrink-0">{trailing}</span>}
    </Comp>
  );
}
