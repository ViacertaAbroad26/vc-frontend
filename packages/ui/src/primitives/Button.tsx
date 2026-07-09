import { Slot } from "@radix-ui/react-slot";
import { type ButtonHTMLAttributes, type Ref, forwardRef } from "react";

import { cn } from "../lib/cn";

const VARIANTS = {
  primary:
    "bg-navy-700 text-white shadow-sm hover:bg-navy-800 hover:shadow-md focus-visible:ring-navy-500",
  accent:
    "bg-mint-400 text-navy-900 shadow-sm hover:bg-mint-500 hover:shadow-md focus-visible:ring-mint-300",
  secondary:
    "bg-white text-navy-700 border border-navy-200 hover:bg-navy-50 focus-visible:ring-navy-300",
  ghost: "bg-transparent text-navy-700 hover:bg-navy-50 focus-visible:ring-navy-300",
  destructive: "bg-flag-red-solid text-white hover:bg-red-700 focus-visible:ring-red-400",
  outline: "bg-transparent text-navy-700 border border-navy-300 hover:bg-navy-50",
} as const;

const SIZES = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
};

export const Button = forwardRef(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    loading,
    fullWidth,
    asChild,
    disabled,
    children,
    ...rest
  }: ButtonProps,
  ref: Ref<HTMLButtonElement>,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && (
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {children}
        </>
      )}
    </Comp>
  );
});
