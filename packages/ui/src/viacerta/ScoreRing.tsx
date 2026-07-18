type Props = {
  value: number; // 0..100
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string; // defaults to mint
};

export function ScoreRing({ value, size = 120, strokeWidth = 10, label, color = "#68b687" }: Props) {
  const pct = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label ?? "Score"} ${pct}%`}>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-gray-200 dark:stroke-navy-700"
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text
          x={cx}
          y={cy + 6}
          textAnchor="middle"
          className="fill-gray-900 dark:fill-gray-50"
          fontSize={size * 0.22}
          fontWeight="700"
        >
          {Math.round(pct)}%
        </text>
      </svg>
      {label && (
        <div className="mt-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
      )}
    </div>
  );
}
