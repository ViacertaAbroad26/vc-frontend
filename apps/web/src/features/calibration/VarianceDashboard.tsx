import { AsyncBoundary, Badge, Card, CardBody, Section } from "@viacerta/ui";

import { useCalibrationVariance } from "./useCalibrationVariance";

export function VarianceDashboard() {
  const { data, isLoading, error } = useCalibrationVariance(true);

  return (
    <Section title="Variance dashboard" description="Inter-rater variance across this week's calibration cases.">
      <AsyncBoundary isLoading={isLoading} error={error} data={data}>
        {(variance) => (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card>
                <CardBody>
                  <p className="text-xs text-gray-500">Cases total</p>
                  <p className="text-lg font-semibold text-navy-700">{variance.casesTotal}</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs text-gray-500">With ≥2 scorers</p>
                  <p className="text-lg font-semibold text-navy-700">{variance.casesWithMultipleScorers}</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs text-gray-500">Average range</p>
                  <p className="text-lg font-semibold text-navy-700">
                    {variance.averageRange != null ? variance.averageRange.toFixed(1) : "—"}
                  </p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs text-gray-500">Threshold</p>
                  <p className="text-lg font-semibold text-navy-700">≤ {variance.thresholdPoints} pts</p>
                </CardBody>
              </Card>
            </div>

            {variance.withinThreshold != null && (
              <Badge variant={variance.withinThreshold ? "green" : "amber"}>
                {variance.withinThreshold ? "Within threshold" : "Above threshold"}
              </Badge>
            )}

            {variance.perCase.length > 0 ? (
              <ul className="space-y-2">
                {variance.perCase.map((c) => (
                  <li key={c.caseId} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
                    <span className="text-gray-600">
                      Week of {new Date(c.weekStarting).toLocaleDateString()} · {c.n} scorers
                    </span>
                    <span className="font-medium text-gray-800">
                      mean {c.mean.toFixed(1)} · range {c.range.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No cases with multiple scorers yet.</p>
            )}
          </div>
        )}
      </AsyncBoundary>
    </Section>
  );
}
