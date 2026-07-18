import { AsyncBoundary, Button, Card, CardBody, PageHeader, ScoreRing } from "@viacerta/ui";
import { routes } from "@viacerta/utils";
import { Award, Lock } from "lucide-react";
import { Link } from "react-router-dom";

import { useAchievements } from "@/features/achievements/useAchievements";
import { NextActionCard } from "@/features/journey/NextActionCard";
import { useJourney } from "@/features/journey/use-journey";
import { JOURNEY_STAGE_LABELS } from "@/lib/journey-stages";

const SEQUENCED_MODEL = ["Career", "Country", "University", "Admission", "Visa", "Settlement", "Success"];

export default function JourneyPage() {
  const { data, isLoading, error } = useJourney();
  const { data: achievements } = useAchievements();

  return (
    <div className="space-y-6">
      <PageHeader title="My Journey" description="Career → Country → University → Success — with each stage gated and earned." />
      <AsyncBoundary isLoading={isLoading} error={error} data={data}>
        {(journey) => {
          const completedCount = JOURNEY_STAGE_LABELS.filter((s) => s.stage < journey.currentStage).length;
          const completionPct = Math.round((completedCount / JOURNEY_STAGE_LABELS.length) * 100);
          const milestones = (achievements?.achievements ?? []).filter((a) => a.earned);

          return (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <NextActionCard journey={journey} />

                {JOURNEY_STAGE_LABELS.map((stage) => {
                  const status =
                    stage.stage < journey.currentStage
                      ? "done"
                      : stage.stage === journey.currentStage
                        ? "current"
                        : "locked";
                  const ctaLabel = status === "done" ? "Review" : status === "current" ? "Continue" : "Preview";
                  const to = routes.stage(stage.stage);

                  return (
                    <Card key={stage.stage}>
                      <CardBody className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                            Stage {stage.stage} · {stage.label}{" "}
                            {status === "done" && (
                              <span className="ml-1 text-xs font-normal text-mint-600 dark:text-mint-400">
                                Complete
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">{stage.description}</p>
                        </div>
                        {status === "locked" ? (
                          <span className="flex shrink-0 items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                            <Lock className="h-3.5 w-3.5" /> Locked
                          </span>
                        ) : (
                          <Link to={to} className="shrink-0">
                            <Button variant={status === "current" ? "primary" : "secondary"} size="sm">
                              {ctaLabel}
                            </Button>
                          </Link>
                        )}
                      </CardBody>
                    </Card>
                  );
                })}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardBody className="flex flex-col items-center text-center">
                    <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Journey Completion</p>
                    <ScoreRing value={completionPct} />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {completedCount} of {JOURNEY_STAGE_LABELS.length} stages complete
                    </p>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">The Sequenced Model</p>
                    <ol className="space-y-2">
                      {SEQUENCED_MODEL.map((step, i) => (
                        <li key={step} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-50 text-[11px] font-semibold text-navy-700 dark:bg-navy-700 dark:text-mint-400">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Milestones Earned</p>
                    {milestones.length ? (
                      <ul className="space-y-2">
                        {milestones.map((m) => (
                          <li key={m.stage} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                            <Award className="h-4 w-4 text-mint-500" /> {m.label} Complete
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Complete Stage 0 to earn your first milestone.</p>
                    )}
                    <Link to={routes.achievements} className="mt-3 inline-block text-xs font-medium text-navy-600 hover:underline dark:text-mint-400">
                      View all achievements →
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
