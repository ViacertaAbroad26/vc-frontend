export type EvidenceLevel = "L1" | "L2" | "L3" | "L4" | "L5";

const STYLES: Record<EvidenceLevel, { className: string; label: string }> = {
  L1: { className: "bg-flag-red-bg text-flag-red-text border-red-200", label: "L1 · Insufficient" },
  L2: { className: "bg-flag-yellow-bg text-flag-yellow-text border-amber-200", label: "L2 · Self-reported" },
  L3: { className: "bg-flag-yellow-bg text-flag-yellow-text border-amber-200", label: "L3 · Partial evidence" },
  L4: { className: "bg-flag-green-bg text-flag-green-text border-green-200", label: "L4 · Verified" },
  L5: { className: "bg-flag-green-bg text-flag-green-text border-green-200", label: "L5 · Fully verified" },
};

export function EvidenceLevelBadge({ level }: { level: EvidenceLevel }) {
  const s = STYLES[level];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}
