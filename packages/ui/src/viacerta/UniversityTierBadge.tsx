export type UniversityTier = "DREAM" | "REACH" | "TARGET" | "SAFE";

const STYLES: Record<UniversityTier, { className: string; label: string }> = {
  DREAM: { className: "bg-violet-100 text-violet-800 border-violet-200", label: "Dream" },
  REACH: { className: "bg-navy-50 text-navy-700 border-navy-200", label: "Reach" },
  TARGET: { className: "bg-flag-green-bg text-flag-green-text border-green-200", label: "Target" },
  SAFE: { className: "bg-flag-yellow-bg text-flag-yellow-text border-amber-200", label: "Safe" },
};

export function UniversityTierBadge({ tier }: { tier: UniversityTier }) {
  const s = STYLES[tier];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}
