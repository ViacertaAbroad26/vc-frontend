import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "../lib/cn";

const VARIANTS = {
  default: "bg-gray-100 text-gray-700 border-gray-200",
  navy: "bg-navy-50 text-navy-700 border-navy-200",
  mint: "bg-mint-50 text-mint-700 border-mint-200",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  green: "bg-flag-green-bg text-flag-green-text border-green-200",
  yellow: "bg-flag-yellow-bg text-flag-yellow-text border-amber-200",
  red: "bg-flag-red-bg text-flag-red-text border-red-200",
} as const;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  PropsWithChildren<{
    variant?: keyof typeof VARIANTS;
  }>;

export function Badge({ className, variant = "default", children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
