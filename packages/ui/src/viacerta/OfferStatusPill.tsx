export type OfferStatus = "APPLIED" | "INTERVIEWING" | "FINAL_ROUND" | "OFFER" | "REJECTED" | "DECLINED";

const STYLES: Record<OfferStatus, { className: string; label: string }> = {
  APPLIED: { className: "bg-flag-yellow-bg text-flag-yellow-text border-amber-200", label: "Applied" },
  INTERVIEWING: { className: "bg-navy-50 text-navy-700 border-navy-200", label: "Interviewing" },
  FINAL_ROUND: { className: "bg-violet-100 text-violet-800 border-violet-200", label: "Final Round" },
  OFFER: { className: "bg-flag-green-bg text-flag-green-text border-green-200", label: "Offer" },
  REJECTED: { className: "bg-flag-red-bg text-flag-red-text border-red-200", label: "Rejected" },
  DECLINED: { className: "bg-flag-red-bg text-flag-red-text border-red-200", label: "Declined" },
};

export function OfferStatusPill({ status }: { status: OfferStatus }) {
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}
