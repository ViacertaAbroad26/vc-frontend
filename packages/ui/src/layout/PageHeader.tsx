import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../lib/cn";

export type PageHeaderProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions, className, ...rest }: PageHeaderProps) {
  return (
    <div
      className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}
      {...rest}
    >
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-navy-900 dark:text-gray-50">{title}</h1>
        {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
