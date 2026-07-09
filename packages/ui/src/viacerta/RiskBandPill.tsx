import { type RiskBand } from "@viacerta/design-tokens";

const STYLES: Record<RiskBand, { className: string; label: string }> = {
  LOW: { className: "bg-flag-green-bg text-flag-green-text border-green-200", label: "Low Risk" },
  MODERATE: {
    className: "bg-flag-yellow-bg text-flag-yellow-text border-amber-200",
    label: "Moderate Risk",
  },
  HIGH: { className: "bg-flag-red-bg text-flag-red-text border-red-200", label: "High Risk" },
  VERY_HIGH: {
    className: "bg-flag-red-bg text-flag-red-text border-red-300",
    label: "Very High Risk",
  },
};

export function RiskBandPill({ band }: { band: RiskBand }) {
  const s = STYLES[band];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}
