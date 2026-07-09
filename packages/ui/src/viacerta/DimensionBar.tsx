type Props = {
  label: string;
  score: number;
  max: number;
  flag?: "GREEN" | "YELLOW" | "RED" | "GRAY";
};

const TRACK = {
  GREEN: "bg-flag-green-solid",
  YELLOW: "bg-flag-yellow-solid",
  RED: "bg-flag-red-solid",
  GRAY: "bg-gray-400",
};

export function DimensionBar({ label, score, max, flag }: Props) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));
  const tone = flag ?? (pct >= 80 ? "GREEN" : pct >= 60 ? "YELLOW" : pct >= 40 ? "RED" : "GRAY");
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-gray-900">{label}</span>
        <span className="tabular-nums text-gray-600">
          {score} <span className="text-gray-400">/ {max}</span>
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div className={`h-full rounded-full transition-all ${TRACK[tone]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
