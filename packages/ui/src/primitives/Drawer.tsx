import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { type Ref, forwardRef } from "react";

import { cn } from "../lib/cn";

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

const SIDE_STYLES = {
  left: "inset-y-0 left-0 h-full w-full max-w-sm border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
  right:
    "inset-y-0 right-0 h-full w-full max-w-sm border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
} as const;

export type DrawerContentProps = DialogPrimitive.DialogContentProps & {
  side?: keyof typeof SIDE_STYLES;
};

export const DrawerContent = forwardRef(function DrawerContent(
  { className, children, side = "right", ...rest }: DrawerContentProps,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-gray-900/40" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 border-gray-200 bg-white p-6 shadow-xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300",
          SIDE_STYLES[side],
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

export const DrawerTitle = DialogPrimitive.Title;
export const DrawerDescription = DialogPrimitive.Description;

export function DrawerHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 space-y-1.5", className)} {...rest} />;
}
