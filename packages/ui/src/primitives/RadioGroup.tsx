import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { type Ref, forwardRef } from "react";

import { cn } from "../lib/cn";

export const RadioGroup = RadioGroupPrimitive.Root;

export type RadioGroupItemProps = RadioGroupPrimitive.RadioGroupItemProps;

export const RadioGroupItem = forwardRef(function RadioGroupItem(
  { className, ...rest }: RadioGroupItemProps,
  ref: Ref<HTMLButtonElement>,
) {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "h-4 w-4 shrink-0 rounded-full border border-gray-300 bg-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:border-navy-700",
        className,
      )}
      {...rest}
    >
      <RadioGroupPrimitive.Indicator className="flex h-full w-full items-center justify-center">
        <span className="h-2 w-2 rounded-full bg-navy-700" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
