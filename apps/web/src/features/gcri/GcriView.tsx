import type { ApiComponents } from "@viacerta/api-client";
import type { RiskBand } from "@viacerta/design-tokens";
import { AsyncBoundary, Button, Card, CardBody, GcriHeatmap, OutcomePredictionBand, RiskBandPill } from "@viacerta/ui";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

import { useStudentDetail } from "@/features/student-detail/useStudentDetail";
import { COUNTRY_LABELS } from "@/lib/country-labels";

import { GcriOverrideDialog } from "./GcriOverrideDialog";
import { useGcriResults } from "./useGcriResults";
import { useTriggerGcri } from "./useTriggerGcri";

type CareerVertical = ApiComponents["schemas"]["CareerVertical"];

export function GcriView({ studentId }: { studentId: string }) {
  const { data, isLoading, error } = useGcriResults(studentId);
  const student = useStudentDetail(studentId);
  const trigger = useTriggerGcri(studentId);
  const [overrideCountry, setOverrideCountry] = useState<string | null>(null);

  return (
    <AsyncBoundary isLoading={isLoading} error={error} data={data}>
      {(gcri) => {
        if (gcri.results.length === 0) {
          const targetCountries = student.data?.targetCountries ?? [];
          const careerGoal = student.data?.careerGoal;
          const assessment = student.data?.assessment;
          const gcssFinal =
            assessment && "gcssFinal" in assessment && typeof assessment.gcssFinal === "number"
              ? assessment.gcssFinal
              : null;
          const canTrigger = (gcssFinal ?? 0) >= 60 && targetCountries.length > 0 && !!careerGoal;

          return (
            <Card>
              <CardBody className="space-y-3">
                <h3 className="font-medium text-gray-900">No GCRI run yet</h3>
                <p className="text-sm text-gray-600">
                  Trigger a run against the student&apos;s target countries. Requires GCSS ≥ 60 (current:{" "}
                  {gcssFinal ?? "—"}).
                </p>
                <Button
                  onClick={() =>
                    trigger.mutate({ countries: targetCountries, careerVertical: careerGoal as CareerVertical })
                  }
                  disabled={!canTrigger || trigger.isPending}
                  loading={trigger.isPending}
                >
                  {targetCountries.length > 0 ? `Run GCRI for ${targetCountries.join(", ")}` : "Run GCRI"}
                </Button>
              </CardBody>
            </Card>
          );
        }

        return (
          <div className="space-y-4">
            <GcriHeatmap
              items={gcri.results.map((r) => ({
                country: r.country,
                finalScore: r.finalScore,
                riskBand: r.riskBand as RiskBand,
              }))}
              labels={COUNTRY_LABELS}
            />

            {gcri.results.map((r) => (
              <Card key={r.country}>
                <CardBody>
                  <header className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{COUNTRY_LABELS[r.country] ?? r.country}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Matrix v{r.matrixVersion ?? r.matrixVersionId}
                        {r.dataSparseFlag && (
                          <span className="ml-2 inline-flex items-center gap-1 text-amber-700">
                            <AlertCircle className="h-3 w-3" /> Data sparse
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-semibold text-gray-900">{r.finalScore.toFixed(0)}</div>
                      <RiskBandPill band={r.riskBand as RiskBand} />
                    </div>
                  </header>

                  <p className="mt-3 text-xs text-gray-500">
                    Base {r.baseScore.toFixed(1)} · overlay {r.overlayDelta > 0 ? "+" : ""}
                    {r.overlayDelta.toFixed(1)}
                    {r.advisorOverrideDelta !== 0 && (
                      <>
                        {" "}
                        · override {r.advisorOverrideDelta > 0 ? "+" : ""}
                        {r.advisorOverrideDelta.toFixed(1)}
                      </>
                    )}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    {r.factorScores.map((f) => (
                      <div key={f.factor} className="rounded bg-gray-50 p-2">
                        <div className="text-gray-500">{factorLabel(f.factor)}</div>
                        <div className="font-medium text-gray-900">
                          {f.weighted.toFixed(1)} / {f.max}
                        </div>
                      </div>
                    ))}
                  </div>

                  {r.outcomeProbability != null && (
                    <div className="mt-3">
                      <OutcomePredictionBand
                        probability={r.outcomeProbability}
                        probabilityLow={r.outcomeProbabilityLow}
                        probabilityHigh={r.outcomeProbabilityHigh}
                        confidenceLevel={r.outcomeConfidenceLevel}
                        modelVersion={r.outcomeProbabilityModelVersion}
                        rationale={r.outcomeProbabilityRationale}
                      />
                    </div>
                  )}

                  <div className="mt-3">
                    <Button variant="ghost" size="sm" onClick={() => setOverrideCountry(r.country)}>
                      Override ±5
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}

            {overrideCountry && (
              <GcriOverrideDialog
                studentId={studentId}
                country={overrideCountry}
                onClose={() => setOverrideCountry(null)}
              />
            )}
          </div>
        );
      }}
    </AsyncBoundary>
  );
}

function factorLabel(f: string): string {
  return f
    .split("_")
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(" ");
}
