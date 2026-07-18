import { Check, Lock, type LucideIcon } from "lucide-react";

import { cn } from "../lib/cn";

type ModuleCardProps = {
  icon?: LucideIcon;
  title: string;
  subtitle?: string | undefined;
  status: "complete" | "available" | "locked";
  onClick?: () => void;
  className?: string;
};

export function ModuleCard({ icon: Icon, title, subtitle, status, onClick, className }: ModuleCardProps) {
  const locked = status === "locked";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition-colors",
        "dark:border-navy-700 dark:bg-navy-800",
        !locked && "hover:border-mint-400 hover:bg-mint-50 dark:hover:bg-navy-700",
        locked && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      {Icon && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mint-50 text-navy-700 dark:bg-navy-700 dark:text-mint-400">
          <Icon className="h-4 w-4" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-50">{title}</span>
        {subtitle && (
          <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{subtitle}</span>
        )}
      </span>
      {status === "complete" && (
        <Check className="h-4 w-4 shrink-0 text-mint-500" aria-label="Complete" />
      )}
      {status === "locked" && (
        <Lock className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" aria-label="Locked" />
      )}
    </button>
  );
}
