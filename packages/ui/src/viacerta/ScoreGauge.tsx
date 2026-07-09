import { type GcssFlag, flagColors } from "@viacerta/design-tokens";

type Props = {
  score: number; // 0..100
  flag: GcssFlag;
  max?: number; // default 100
  label?: string;
};

export function ScoreGauge({ score, flag, max = 100, label = "GCSS" }: Props) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));
  const angle = (pct / 100) * 180;
  const radius = 80;
  const cx = 100,
    cy = 100;
  const startX = cx - radius,
    startY = cy;
  const endRad = (Math.PI * (180 - angle)) / 180;
  const endX = cx + radius * Math.cos(endRad);
  const endY = cy - radius * Math.sin(endRad);
  const largeArc = angle > 180 ? 1 : 0;
  const arcPath = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`;
  const color = flagColors[flag].solid;

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="120" viewBox="0 0 200 120" role="img" aria-label={`${label} ${score} of ${max}`}>
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path d={arcPath} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
        <text x={cx} y={cy - 8} textAnchor="middle" className="fill-gray-900" fontSize="40" fontWeight="700">
          {Math.round(score)}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="fill-gray-500" fontSize="12">
          / {max}
        </text>
      </svg>
      <div className="mt-2 text-xs uppercase tracking-wide text-gray-500">{label}</div>
    </div>
  );
}
