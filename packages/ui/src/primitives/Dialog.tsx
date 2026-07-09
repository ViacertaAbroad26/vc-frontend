import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { type Ref, forwardRef } from "react";

import { cn } from "../lib/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = forwardRef(function DialogOverlay(
  { className, ...rest }: DialogPrimitive.DialogOverlayProps,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-gray-900/40",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className,
      )}
      {...rest}
    />
  );
});

export const DialogContent = forwardRef(function DialogContent(
  { className, children, ...rest }: DialogPrimitive.DialogContentProps,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
          "rounded-xl border border-gray-200 bg-white p-6 shadow-xl",
          className,
        )}
        {...rest}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            "absolute right-4 top-4 rounded-sm text-gray-500",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400",
            "hover:text-gray-900",
          )}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

export function DialogHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 space-y-1.5", className)} {...rest} />;
}

export function DialogFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-6 flex justify-end gap-2", className)} {...rest} />
  );
}

export const DialogTitle = forwardRef(function DialogTitle(
  { className, ...rest }: DialogPrimitive.DialogTitleProps,
  ref: Ref<HTMLHeadingElement>,
) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("text-lg font-semibold text-gray-900", className)}
      {...rest}
    />
  );
});

export const DialogDescription = forwardRef(function DialogDescription(
  { className, ...rest }: DialogPrimitive.DialogDescriptionProps,
  ref: Ref<HTMLParagraphElement>,
) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-sm text-gray-600", className)}
      {...rest}
    />
  );
});
