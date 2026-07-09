import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type Ref, forwardRef } from "react";

import { cn } from "../lib/cn";

export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef(function TabsList(
  { className, ...rest }: TabsPrimitive.TabsListProps,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-gray-100 p-1 text-gray-600",
        className,
      )}
      {...rest}
    />
  );
});

export const TabsTrigger = forwardRef(function TabsTrigger(
  { className, ...rest }: TabsPrimitive.TabsTriggerProps,
  ref: Ref<HTMLButtonElement>,
) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:bg-white data-[state=active]:text-navy-700 data-[state=active]:shadow-sm",
        className,
      )}
      {...rest}
    />
  );
});

export const TabsContent = forwardRef(function TabsContent(
  { className, ...rest }: TabsPrimitive.TabsContentProps,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn("mt-4 focus-visible:outline-none", className)}
      {...rest}
    />
  );
});
