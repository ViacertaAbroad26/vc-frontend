export type ApplicationStatus =
  | "NOT_STARTED"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "OFFER_RECEIVED"
  | "WAITLISTED"
  | "ACCEPTED"
  | "REJECTED"
  | "DECLINED";

const STYLES: Record<ApplicationStatus, { className: string; label: string }> = {
  NOT_STARTED: { className: "bg-gray-100 text-gray-700 border-gray-200", label: "Not Started" },
  SUBMITTED: { className: "bg-navy-50 text-navy-700 border-navy-200", label: "Submitted" },
  UNDER_REVIEW: { className: "bg-flag-yellow-bg text-flag-yellow-text border-amber-200", label: "Under Review" },
  OFFER_RECEIVED: { className: "bg-flag-green-bg text-flag-green-text border-green-200", label: "Offer" },
  ACCEPTED: { className: "bg-flag-green-bg text-flag-green-text border-green-200", label: "Accepted" },
  WAITLISTED: { className: "bg-violet-100 text-violet-800 border-violet-200", label: "Waitlisted" },
  REJECTED: { className: "bg-flag-red-bg text-flag-red-text border-red-200", label: "Rejected" },
  DECLINED: { className: "bg-flag-red-bg text-flag-red-text border-red-200", label: "Declined" },
};

export function ApplicationStatusPill({ status }: { status: ApplicationStatus }) {
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}
