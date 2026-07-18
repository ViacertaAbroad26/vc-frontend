import { cn } from "../lib/cn";

type CountryCardProps = {
  name: string;
  flagEmoji?: string;
  rank?: string; // e.g. "Top match", "#2"
  score?: number; // 0..100, rendered as a bar
  className?: string;
};

export function CountryCard({ name, flagEmoji, rank, score, className }: CountryCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3",
        "dark:border-navy-700 dark:bg-navy-800",
        className,
      )}
    >
      {flagEmoji && <span className="text-xl leading-none">{flagEmoji}</span>}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">{name}</p>
        {rank && <p className="truncate text-xs text-gray-500 dark:text-gray-400">{rank}</p>}
        {typeof score === "number" && (
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-navy-700">
            <div
              className="h-full rounded-full bg-mint-400"
              style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
            />
          </div>
        )}
      </div>
      {typeof score === "number" && (
        <span className="shrink-0 text-sm font-semibold text-navy-700 dark:text-mint-400">{score}</span>
      )}
    </div>
  );
}
