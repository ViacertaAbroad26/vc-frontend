import { AsyncBoundary, Badge, Button, Card, CardBody, Section } from "@viacerta/ui";

import { useCalibrationCorrelations } from "./useCalibrationCorrelations";
import { useDraftRubric } from "./useDraftRubric";

function correlationLabel(c: number | null | undefined, n: number): string {
  return c == null ? `n=${n}` : `${c.toFixed(2)} (n=${n})`;
}

export function CalibrationLoopSection() {
  const { data, isLoading, error } = useCalibrationCorrelations(true);
  const draft = useDraftRubric();

  return (
    <Section
      title="Calibration loop"
      description="Outcome-correlation dataset feeding the bi-annual rubric calibration loop (Phase 3)."
    >
      <AsyncBoundary isLoading={isLoading} error={error} data={data}>
        {(corr) => (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card>
                <CardBody>
                  <p className="text-xs text-gray-500">Outcome-linked sample</p>
                  <p className="text-lg font-semibold text-navy-700">{corr.sampleSize}</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs text-gray-500">Calibration threshold</p>
                  <p className="text-lg font-semibold text-navy-700">{corr.calibrationMinSample}</p>
                  <Badge variant={corr.dataSufficientForCalibration ? "green" : "amber"} className="mt-1">
                    {corr.dataSufficientForCalibration ? "Sufficient" : "Insufficient"}
                  </Badge>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs text-gray-500">Predictive model threshold</p>
                  <p className="text-lg font-semibold text-navy-700">{corr.predictiveModelThreshold}</p>
                  <Badge variant={corr.dataSufficientForPredictiveModel ? "green" : "amber"} className="mt-1">
                    {corr.dataSufficientForPredictiveModel ? "Sufficient" : "Insufficient"}
                  </Badge>
                </CardBody>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-900">GCSS sub-component correlations</h3>
                {corr.gcssSubcomponentCorrelations.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm">
                    {corr.gcssSubcomponentCorrelations.map((c) => (
                      <li key={c.subComponentKey} className="flex justify-between rounded bg-gray-50 px-2 py-1">
                        <span className="text-gray-700">{c.subComponentKey.replace(/_/g, " ").toLowerCase()}</span>
                        <span className="font-medium text-gray-800">{correlationLabel(c.correlation, c.n)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">No outcome data yet.</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900">GCRI factor correlations</h3>
                {corr.gcriFactorCorrelations.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm">
                    {corr.gcriFactorCorrelations.map((c) => (
                      <li key={c.factor} className="flex justify-between rounded bg-gray-50 px-2 py-1">
                        <span className="text-gray-700">{c.factor.replace(/_/g, " ").toLowerCase()}</span>
                        <span className="font-medium text-gray-800">{correlationLabel(c.correlation, c.n)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">No outcome data yet.</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <Button
                onClick={() => draft.mutate()}
                disabled={!corr.dataSufficientForCalibration || draft.isPending}
                loading={draft.isPending}
              >
                Draft new rubric proposal
              </Button>
              {!corr.dataSufficientForCalibration && (
                <p className="mt-1 text-xs text-gray-500">
                  Need at least {corr.calibrationMinSample} outcome-linked assessments to draft a proposal (have{" "}
                  {corr.sampleSize}).
                </p>
              )}
              {draft.isError && (
                <p className="mt-1 text-xs text-flag-red-solid">Could not draft a rubric proposal. Please try again.</p>
              )}
              {draft.data && (
                <Card className="mt-3">
                  <CardBody className="space-y-1">
                    <p className="font-medium text-navy-700">
                      Drafted {draft.data.version} (from {draft.data.draftedFromVersion})
                    </p>
                    <p className="text-sm text-gray-600">{draft.data.notes}</p>
                    <p className="text-xs text-gray-500">
                      Review per-sub-component calibration notes, then publish/activate via the rubric-version tools.
                    </p>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        )}
      </AsyncBoundary>
    </Section>
  );
}
