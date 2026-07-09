import type { HTMLAttributes, PropsWithChildren, ReactNode } from "react";

import { cn } from "../lib/cn";

export type SectionProps = HTMLAttributes<HTMLElement> &
  PropsWithChildren<{
    title?: string;
    description?: string;
    actions?: ReactNode;
  }>;

export function Section({ title, description, actions, className, children, ...rest }: SectionProps) {
  return (
    <section className={cn("space-y-4", className)} {...rest}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4">
          <div>
            {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
            {description && <p className="text-sm text-gray-600">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
