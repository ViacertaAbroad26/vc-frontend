import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export type ErrorStateProps = {
  error?: unknown;
  title?: string;
  action?: ReactNode;
  className?: string;
};

function messageFor(error: unknown): string | undefined {
  if (error instanceof Error) return error.message;
  return undefined;
}

export function ErrorState({
  error,
  title = "Something went wrong",
  action,
  className,
}: ErrorStateProps) {
  const detail = messageFor(error);
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-flag-red-bg px-6 py-12 text-center",
        className,
      )}
    >
      <AlertTriangle className="h-8 w-8 text-flag-red-text" aria-hidden />
      <div className="space-y-1">
        <p className="text-sm font-medium text-flag-red-text">{title}</p>
        {detail && <p className="text-sm text-flag-red-text/80">{detail}</p>}
      </div>
      {action}
    </div>
  );
}
