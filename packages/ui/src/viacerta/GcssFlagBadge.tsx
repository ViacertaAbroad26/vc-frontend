import { type GcssFlag } from "@viacerta/design-tokens";

const STYLES: Record<GcssFlag, { className: string; label: string }> = {
  GREEN: {
    className: "bg-flag-green-bg text-flag-green-text border-green-200",
    label: "Ready",
  },
  YELLOW: {
    className: "bg-flag-yellow-bg text-flag-yellow-text border-amber-200",
    label: "Ready with Plan",
  },
  RED: {
    className: "bg-flag-red-bg text-flag-red-text border-red-200",
    label: "Not Yet Ready",
  },
  DECLINED: {
    className: "bg-gray-100 text-gray-700 border-gray-200",
    label: "Refer to Prep Resources",
  },
};

export function GcssFlagBadge({
  flag,
  size = "md",
}: {
  flag: GcssFlag;
  size?: "sm" | "md" | "lg";
}) {
  const s = STYLES[flag];
  const sizeCls =
    size === "sm" ? "text-xs px-2 py-0.5" : size === "lg" ? "text-base px-4 py-1.5" : "text-sm px-3 py-1";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border font-medium ${sizeCls} ${s.className}`}
    >
      {s.label}
    </span>
  );
}
