import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { type Ref, forwardRef } from "react";

import { cn } from "../lib/cn";

export const ToastProvider = ToastPrimitive.Provider;

export const ToastViewport = forwardRef(function ToastViewport(
  { className, ...rest }: ToastPrimitive.ToastViewportProps,
  ref: Ref<HTMLOListElement>,
) {
  return (
    <ToastPrimitive.Viewport
      ref={ref}
      className={cn(
        "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-sm",
        className,
      )}
      {...rest}
    />
  );
});

const VARIANTS = {
  default: "border-gray-200 bg-white text-gray-900",
  success: "border-green-200 bg-flag-green-bg text-flag-green-text",
  warning: "border-amber-200 bg-flag-yellow-bg text-flag-yellow-text",
  destructive: "border-red-200 bg-flag-red-bg text-flag-red-text",
} as const;

export type ToastProps = ToastPrimitive.ToastProps & {
  variant?: keyof typeof VARIANTS;
};

export const Toast = forwardRef(function Toast(
  { className, variant = "default", ...rest }: ToastProps,
  ref: Ref<HTMLLIElement>,
) {
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(
        "pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg border p-4 shadow-lg",
        "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-full",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-80",
        "data-[swipe=end]:animate-out data-[swipe=end]:slide-out-to-right-full",
        VARIANTS[variant],
        className,
      )}
      {...rest}
    />
  );
});

export const ToastTitle = forwardRef(function ToastTitle(
  { className, ...rest }: ToastPrimitive.ToastTitleProps,
  ref: Ref<HTMLDivElement>,
) {
  return <ToastPrimitive.Title ref={ref} className={cn("text-sm font-semibold", className)} {...rest} />;
});

export const ToastDescription = forwardRef(function ToastDescription(
  { className, ...rest }: ToastPrimitive.ToastDescriptionProps,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <ToastPrimitive.Description ref={ref} className={cn("text-sm opacity-90", className)} {...rest} />
  );
});

export const ToastClose = forwardRef(function ToastClose(
  { className, ...rest }: ToastPrimitive.ToastCloseProps,
  ref: Ref<HTMLButtonElement>,
) {
  return (
    <ToastPrimitive.Close
      ref={ref}
      className={cn(
        "rounded-md p-1 text-current/60 transition-colors hover:text-current",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400",
        className,
      )}
      {...rest}
    >
      <X className="h-4 w-4" />
    </ToastPrimitive.Close>
  );
});

export const ToastAction = forwardRef(function ToastAction(
  { className, ...rest }: ToastPrimitive.ToastActionProps,
  ref: Ref<HTMLButtonElement>,
) {
  return (
    <ToastPrimitive.Action
      ref={ref}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-current/20 px-3 text-sm font-medium",
        "hover:bg-current/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400",
        className,
      )}
      {...rest}
    />
  );
});
