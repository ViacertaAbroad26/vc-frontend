import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "../lib/cn";

export function Card({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & PropsWithChildren) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow",
        "dark:border-navy-700 dark:bg-navy-800",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & PropsWithChildren) {
  return (
    <div
      className={cn("border-b border-gray-100 px-6 py-4 dark:border-navy-700", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & PropsWithChildren) {
  return (
    <div className={cn("p-6", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & PropsWithChildren) {
  return (
    <div
      className={cn("border-t border-gray-100 px-6 py-4 dark:border-navy-700", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
