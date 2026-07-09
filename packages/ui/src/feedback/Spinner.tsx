import { cn } from "../lib/cn";

const SIZES = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
} as const;

export type SpinnerProps = {
  size?: keyof typeof SIZES;
  className?: string;
  label?: string;
};

export function Spinner({ size = "md", className, label = "Loading" }: SpinnerProps) {
  return (
    <div role="status" className={cn("inline-flex items-center justify-center", className)}>
      <span
        className={cn(
          "animate-spin rounded-full border-navy-200 border-t-navy-700",
          SIZES[size],
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
