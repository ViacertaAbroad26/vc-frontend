import { Card, CardBody, DimensionBar, PageHeader, Spinner, StatTile } from "@viacerta/ui";

import { ReadinessTrendChart } from "./ReadinessTrendChart";
import { useAnalytics } from "./useAnalytics";

export function AnalyticsView() {
  const { data, isLoading } = useAnalytics();

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const latest = data.snapshots.at(-1);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Your readiness score over time and current dimension breakdown." />

      <Card>
        <CardBody>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Readiness Trend</h3>
            {latest && <StatTile label="Latest GCSS" value={String(Math.round(latest.gcssFinal))} />}
          </div>
          {data.snapshots.length > 0 ? (
            <ReadinessTrendChart snapshots={data.snapshots} />
          ) : (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No readiness history yet — your first snapshot is recorded the next time your assessment is scored,
              confirmed, or overridden.
            </p>
          )}
        </CardBody>
      </Card>

      {data.currentDimensions.length > 0 && (
        <Card>
          <CardBody className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Current Dimension Breakdown</h3>
            {data.currentDimensions.map((d) => (
              <DimensionBar key={d.dimension} label={d.label} score={d.raw} max={d.max} />
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
