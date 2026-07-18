import { ApplicationStatusPill, Card, CardBody, type ApplicationStatus } from "@viacerta/ui";

import { isoToFlag } from "@/features/stage2-strategy/iso-to-flag";

import type { StudentApplicationTracker } from "./useApplicationTracker";

const GROUP_ORDER: ApplicationStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "OFFER_RECEIVED",
  "ACCEPTED",
  "WAITLISTED",
  "REJECTED",
  "DECLINED",
  "NOT_STARTED",
];

const GROUP_LABELS: Record<ApplicationStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  OFFER_RECEIVED: "Offer",
  ACCEPTED: "Accepted",
  WAITLISTED: "Waitlisted",
  REJECTED: "Rejected",
  DECLINED: "Declined",
  NOT_STARTED: "Not Started",
};

export function ApplicationTrackerPanel({ tracker }: { tracker: StudentApplicationTracker }) {
  const applications = tracker.applications ?? [];
  const counts = GROUP_ORDER.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  })).filter((g) => g.count > 0);

  return (
    <Card>
      <CardBody>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Application Tracker</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {applications.length} universit{applications.length === 1 ? "y" : "ies"}
          </span>
        </div>

        <div className="mb-4 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-300">
          {counts.map((g) => (
            <span key={g.status} className="flex items-center gap-1.5">
              <ApplicationStatusPill status={g.status as ApplicationStatus} />
              <span className="font-medium text-gray-900 dark:text-gray-50">{g.count}</span>
            </span>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {applications.map((app) => (
            <div
              key={app.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 p-3 dark:border-navy-700"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate text-sm font-medium text-gray-900 dark:text-gray-50">
                  <span>{isoToFlag(app.country)}</span>
                  {app.university}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {app.submittedAt
                    ? `Submitted ${new Date(app.submittedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`
                    : (app.notes ?? GROUP_LABELS[app.status as ApplicationStatus])}
                </p>
              </div>
              <ApplicationStatusPill status={app.status as ApplicationStatus} />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
