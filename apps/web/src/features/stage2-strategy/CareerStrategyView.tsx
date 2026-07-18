import { ApiError } from "@viacerta/api-client";
import { Button, Card, CardBody, CountryCard, PageHeader, RiskBandPill, Spinner, StatTile } from "@viacerta/ui";
import { useState } from "react";

import { GcriRadarChart } from "./GcriRadarChart";
import { isoToFlag } from "./iso-to-flag";
import { useGcriResults } from "./useGcriResults";
import { useTriggerGcri } from "./useTriggerGcri";

export function CareerStrategyView() {
  const [polling, setPolling] = useState(false);
  const { data, isLoading, error } = useGcriResults({ pollWhileMissing: polling });
  const trigger = useTriggerGcri();

  const notComputedYet = error instanceof ApiError && error.status === 404;
  const gatingError = error instanceof ApiError && (error.status === 409 || error.status === 422);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!data || notComputedYet || gatingError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Stage 2 · Career Strategy"
          description="A 7-axis Global Career Risk Index across your target countries, plus a recommended career path."
        />
        <Card>
          <CardBody className="space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              This stage needs a completed Global Career Assessment (GCSS ≥ 60) and your target
              countries from Stage 1. Once computed, you&apos;ll see a risk radar for each country
              and a recommended career path.
            </p>
            {gatingError && error && (
              <p className="text-sm text-flag-red-text">{(error as ApiError).message}</p>
            )}
            {polling && (
              <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Spinner /> Computing your career strategy — this usually takes under a minute...
              </p>
            )}
            <Button
              variant="accent"
              disabled={trigger.isPending}
              onClick={() => {
                setPolling(true);
                trigger.mutate();
              }}
            >
              {trigger.isPending ? "Starting..." : "Compute my strategy"}
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const countries = data.countries ?? [];
  const top = countries[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage 2 · Career Strategy"
        description="Your 7-axis career risk index across target countries, and a recommended path."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="GCSS score" value={String(Math.round(data.gcssFinal ?? 0))} />
        <StatTile label="Top country" value={top ? `${isoToFlag(top.country)} ${top.country}` : "—"} />
        <StatTile label="Countries assessed" value={String(countries.length)} />
      </div>

      {data.careerPath && (
        <Card>
          <CardBody>
            <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Recommended career path
            </h3>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-50">
              {data.careerPath.title}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Entry salary (USD)</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  {data.careerPath.entrySalaryUsdRange}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Growth rate</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  {data.careerPath.growthRatePct}% / yr
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Demand</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  {data.careerPath.demandLevel}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {top && (
        <Card>
          <CardBody>
            <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
              Risk profile — top match ({isoToFlag(top.country)} {top.country})
            </h3>
            <GcriRadarChart factors={top.factors ?? []} />
          </CardBody>
        </Card>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Ranked countries</h3>
        {countries.map((c) => (
          <div key={c.country} className="flex items-center gap-3">
            <div className="flex-1">
              <CountryCard
                name={c.country}
                flagEmoji={isoToFlag(c.country)}
                score={Math.round(c.score)}
              />
            </div>
            <RiskBandPill band={c.riskBand as "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH"} />
          </div>
        ))}
      </div>
    </div>
  );
}
