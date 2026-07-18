import {
  AsyncBoundary,
  Button,
  Card,
  CardBody,
  ListRow,
  ScoreRing,
  StageRail,
  StatTile,
} from "@viacerta/ui";
import { routes } from "@viacerta/utils";
import { Bell, Calendar, FileText, Globe2, Sparkles, User } from "lucide-react";
import { Link } from "react-router-dom";

import { useMyNotifications } from "@/features/notifications/useMyNotifications";
import { useJourney } from "@/features/journey/use-journey";
import { useStudentReport } from "@/features/report/useStudentReport";
import { useSession1Booking } from "@/features/session-prep/booking/useSession1Booking";
import { JOURNEY_STAGE_LABELS } from "@/lib/journey-stages";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardPage() {
  const { data: journey, isLoading, error } = useJourney();
  const { data: report } = useStudentReport();
  const { data: booking } = useSession1Booking();
  const { data: notifications } = useMyNotifications();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.fullName.split(" ")[0];

  return (
    <div className="space-y-6">
      <AsyncBoundary isLoading={isLoading} error={error} data={journey}>
        {(journeyData) => {
          const overallPct = Math.round(((journeyData.currentStage - 1) / 7) * 100);
          const stageItems = JOURNEY_STAGE_LABELS.map((s) => ({
            label: s.label,
            status:
              s.stage < journeyData.currentStage
                ? ("done" as const)
                : s.stage === journeyData.currentStage
                  ? ("current" as const)
                  : ("locked" as const),
          }));
          const currentLabel = JOURNEY_STAGE_LABELS.find((s) => s.stage === journeyData.currentStage);
          const topCountry = report?.gcri?.[0]?.country;
          const nextAction = journeyData.nextActions?.[0];

          return (
            <div className="space-y-6">
              {/* Welcome banner */}
              <Card className="overflow-hidden border-none bg-navy-700 dark:bg-navy-800">
                <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-mint-300">
                      Career-First Journey · Stage {journeyData.currentStage} of 7
                    </p>
                    <h1 className="mt-1 font-heading text-xl font-semibold text-white">
                      Welcome back, {firstName}
                    </h1>
                    {currentLabel && (
                      <p className="mt-1 text-sm text-white/70">
                        You're building your <span className="font-medium text-white">{currentLabel.label}</span> —{" "}
                        {currentLabel.description.toLowerCase()}.
                      </p>
                    )}
                    <Link to={routes.journey}>
                      <Button variant="accent" className="mt-3">
                        Resume journey
                      </Button>
                    </Link>
                  </div>
                  <ScoreRing value={overallPct} label="Overall Journey" size={104} />
                </CardBody>
              </Card>

              {/* Stat tiles */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatTile
                  icon={Sparkles}
                  label="Career Readiness"
                  value={report ? `${Math.round(report.gcss.total)}` : "—"}
                  delta={report ? report.gcss.flag : "Not yet assessed"}
                />
                <StatTile
                  icon={Globe2}
                  label="Country Fit"
                  value={topCountry ?? "—"}
                  delta={topCountry ? "Top match" : "Locked until Stage 2"}
                />
                <StatTile
                  icon={Calendar}
                  label="Upcoming Session"
                  value={booking ? "1" : "0"}
                  delta={booking ? new Date(booking.scheduledAt).toLocaleDateString() : "None booked"}
                />
                <StatTile
                  icon={Bell}
                  label="Pending Tasks"
                  value={String(journeyData.nextActions?.length ?? 0)}
                  delta={nextAction ? "Action needed" : "All caught up"}
                />
              </div>

              {/* 8-stage progress rail */}
              <Card>
                <CardBody>
                  <p className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">Your Journey Progress</p>
                  <StageRail
                    items={[
                      { label: "Discovery", status: "done" as const },
                      ...stageItems,
                    ]}
                  />
                </CardBody>
              </Card>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Pending tasks */}
                <Card className="lg:col-span-2">
                  <CardBody>
                    <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Pending Tasks</p>
                    {journeyData.nextActions?.length ? (
                      <div className="space-y-1">
                        {journeyData.nextActions.map((action, i) => (
                          <ListRow
                            key={i}
                            title={action.description}
                            subtitle={action.dueAt ? `Due ${new Date(action.dueAt).toLocaleDateString()}` : undefined}
                            trailing={<span className="text-xs text-gray-400">{action.actorRole}</span>}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nothing pending — you're all caught up.</p>
                    )}
                  </CardBody>
                </Card>

                {/* Upcoming session + advisor */}
                <div className="space-y-6">
                  <Card>
                    <CardBody>
                      <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Session</p>
                      {booking ? (
                        <ListRow
                          title="Strategy Review"
                          subtitle={`${new Date(booking.scheduledAt).toLocaleString()} · ${booking.durationMinutes} min`}
                        />
                      ) : (
                        <Link to={routes.mySessionPrep} className="text-sm text-navy-700 underline dark:text-mint-400">
                          Book a session
                        </Link>
                      )}
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Career Advisor</p>
                      {journeyData.advisorName ? (
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-700 text-sm font-semibold text-white dark:bg-mint-400 dark:text-navy-900">
                            <User className="h-4 w-4" />
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                            {journeyData.advisorName}
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Not yet assigned</p>
                      )}
                    </CardBody>
                  </Card>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent activity */}
                <Card className="lg:col-span-2">
                  <CardBody>
                    <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Recent Activity</p>
                    {notifications?.items.length ? (
                      <div className="space-y-1">
                        {notifications.items.slice(0, 5).map((n) => (
                          <ListRow
                            key={n.id}
                            title={n.title}
                            subtitle={new Date(n.createdAt).toLocaleDateString()}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity.</p>
                    )}
                  </CardBody>
                </Card>

                {/* Quick actions */}
                <Card>
                  <CardBody className="space-y-2">
                    <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Quick Actions</p>
                    <Link to={routes.aiAssistant}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Sparkles className="h-4 w-4" /> Ask AI
                      </Button>
                    </Link>
                    <Link to={routes.documents}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <FileText className="h-4 w-4" /> Upload document
                      </Button>
                    </Link>
                    <Link to={routes.mySessionPrep}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Calendar className="h-4 w-4" /> Book session
                      </Button>
                    </Link>
                  </CardBody>
                </Card>
              </div>
            </div>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
