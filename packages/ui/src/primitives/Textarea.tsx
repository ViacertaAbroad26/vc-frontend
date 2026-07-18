import { type Ref, type TextareaHTMLAttributes, forwardRef } from "react";

import { cn } from "../lib/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

export const Textarea = forwardRef(function Textarea(
  { className, error, ...rest }: TextareaProps,
  ref: Ref<HTMLTextAreaElement>,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900",
        "placeholder:text-gray-400",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error ? "border-flag-red-solid focus-visible:ring-red-400" : "border-gray-300",
        className,
      )}
      {...rest}
    />
  );
});
