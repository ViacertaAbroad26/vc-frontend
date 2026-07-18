import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { type Ref, forwardRef } from "react";

import { cn } from "../lib/cn";

export const Accordion = AccordionPrimitive.Root;

export const AccordionItem = forwardRef(function AccordionItem(
  { className, ...rest }: AccordionPrimitive.AccordionItemProps,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn("border-b border-gray-200", className)}
      {...rest}
    />
  );
});

export const AccordionTrigger = forwardRef(function AccordionTrigger(
  { className, children, ...rest }: AccordionPrimitive.AccordionTriggerProps,
  ref: Ref<HTMLButtonElement>,
) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-50",
          "transition-all [&[data-state=open]>svg]:rotate-180",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400",
          className,
        )}
        {...rest}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

export const AccordionContent = forwardRef(function AccordionContent(
  { className, children, ...rest }: AccordionPrimitive.AccordionContentProps,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden text-sm text-gray-600",
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className,
      )}
      {...rest}
    >
      <div className="pb-4">{children}</div>
    </AccordionPrimitive.Content>
  );
});
