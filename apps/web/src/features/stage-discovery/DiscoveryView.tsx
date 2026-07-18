import { AsyncBoundary, Button, Card, CardBody, ModuleCard, PageHeader, ScoreRing } from "@viacerta/ui";
import { routes } from "@viacerta/utils";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { useJourney } from "@/features/journey/use-journey";

import { DISCOVERY_MODULES, useDiscoveryProgress } from "./useDiscoveryProgress";

const PHILOSOPHY_STEPS = ["Career", "Country", "University", "Admission", "Visa", "Settlement", "Success"];

export function DiscoveryView() {
  const { completed, toggle, pct } = useDiscoveryProgress();
  const { data: journey, isLoading: journeyLoading, error: journeyError } = useJourney();
  const allDone = pct === 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage 0 · Discovery"
        description="Orientation before assessment — philosophy, platform tour and the readiness checklist."
      />

      <Card>
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50">Understand ViaCerta & prepare</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get oriented before assessment — learn the career-first philosophy, tour the platform, and complete
              the readiness checklist.
            </p>
            {allDone && journey && (
              <Link to={routes.stage(1)} className="mt-3 inline-block">
                <Button variant="accent" className="gap-2">
                  Continue to Stage 1 <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
          <ScoreRing value={pct} label={`${completed.size} of ${DISCOVERY_MODULES.length} modules`} />
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardBody>
            <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Modules</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {DISCOVERY_MODULES.map((mod) => (
                <ModuleCard
                  key={mod.key}
                  title={mod.title}
                  subtitle={mod.subtitle}
                  status={completed.has(mod.key) ? "complete" : "available"}
                  onClick={() => toggle(mod.key)}
                />
              ))}
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardBody>
              <p className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <PlayCircle className="h-4 w-4" /> Welcome Video
              </p>
              <div className="flex aspect-video items-center justify-center rounded-lg bg-navy-700 text-white dark:bg-navy-900">
                <PlayCircle className="h-10 w-10 opacity-80" />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                How your global career journey works
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">The Career-First Philosophy</p>
              <div className="flex flex-wrap items-center gap-1 text-xs">
                {PHILOSOPHY_STEPS.map((step, i) => (
                  <span key={step} className="flex items-center gap-1">
                    <span
                      className={
                        i === 0
                          ? "rounded-full bg-navy-700 px-2 py-1 font-medium text-white dark:bg-mint-400 dark:text-navy-900"
                          : "rounded-full bg-gray-100 px-2 py-1 text-gray-600 dark:bg-navy-700 dark:text-gray-300"
                      }
                    >
                      {step}
                    </span>
                    {i < PHILOSOPHY_STEPS.length - 1 && <ArrowRight className="h-3 w-3 text-gray-300" />}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Most students pick a country first, then reverse-engineer a career. ViaCerta inverts that: we design
                the career first and let it determine the country, university and pathway. That's why country
                recommendations are never made before Stage 2.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Advisor Notes</p>
              <AsyncBoundary isLoading={journeyLoading} error={journeyError} data={journey}>
                {(j) => (
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {j.advisorName
                      ? `${j.advisorName}: Complete the knowledge checklist before your discovery call — it makes the session more productive.`
                      : "Your advisor will be assigned shortly."}
                  </p>
                )}
              </AsyncBoundary>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
