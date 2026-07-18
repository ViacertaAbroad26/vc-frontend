import * as LabelPrimitive from "@radix-ui/react-label";
import { type Ref, forwardRef } from "react";

import { cn } from "../lib/cn";

export type LabelProps = LabelPrimitive.LabelProps;

export const Label = forwardRef(function Label(
  { className, ...rest }: LabelProps,
  ref: Ref<HTMLLabelElement>,
) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none text-gray-900 dark:text-gray-50",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...rest}
    />
  );
});
