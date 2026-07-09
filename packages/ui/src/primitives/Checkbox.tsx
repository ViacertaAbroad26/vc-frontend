import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { type Ref, forwardRef } from "react";

import { cn } from "../lib/cn";

export type CheckboxProps = CheckboxPrimitive.CheckboxProps;

export const Checkbox = forwardRef(function Checkbox(
  { className, ...rest }: CheckboxProps,
  ref: Ref<HTMLButtonElement>,
) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "h-4 w-4 shrink-0 rounded-sm border border-gray-300 bg-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-navy-700 data-[state=checked]:border-navy-700 data-[state=checked]:text-white",
        className,
      )}
      {...rest}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Check className="h-3.5 w-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
