import type { RiskBand } from "@viacerta/design-tokens";

export type GcriHeatmapItem = {
  country: string;
  finalScore: number;
  riskBand: RiskBand;
};

const CELL_STYLES: Record<RiskBand, string> = {
  LOW: "bg-flag-green-bg text-flag-green-text border-green-200",
  MODERATE: "bg-flag-yellow-bg text-flag-yellow-text border-amber-200",
  HIGH: "bg-flag-red-bg text-flag-red-text border-red-200",
  VERY_HIGH: "bg-flag-red-solid text-white border-red-300",
};

export function GcriHeatmap({ items, labels }: { items: GcriHeatmapItem[]; labels?: Record<string, string> }) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
      {items.map((item) => (
        <div
          key={item.country}
          className={`flex flex-col items-center rounded-md border px-2 py-3 text-center ${CELL_STYLES[item.riskBand]}`}
        >
          <span className="text-xs font-medium">{labels?.[item.country] ?? item.country}</span>
          <span className="text-xl font-semibold tabular-nums">{item.finalScore.toFixed(0)}</span>
        </div>
      ))}
    </div>
  );
}
