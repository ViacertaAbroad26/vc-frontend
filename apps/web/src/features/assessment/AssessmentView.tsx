import type { ApiComponents } from "@viacerta/api-client";
import type { GcssFlag } from "@viacerta/design-tokens";
import type { EvidenceLevel } from "@viacerta/ui";
import { AsyncBoundary, Badge, Button, Card, CardBody, EvidenceLevelBadge, GcssFlagBadge, ScoreGauge } from "@viacerta/ui";
import { useState } from "react";

import { OverrideDialog, type OverrideTarget } from "./OverrideDialog";
import { useAssessment } from "./useAssessment";
import { useConfirmAssessment } from "./useConfirmAssessment";

type GcssDimension = ApiComponents["schemas"]["GcssDimension"];

const DIMENSION_LABELS: Record<string, string> = {
  ACADEMIC_AND_COGNITIVE_READINESS: "Academic & Cognitive Readiness",
  SKILL_BASELINE: "Skill Baseline",
  FINANCIAL_STABILITY: "Financial Stability",
  CAREER_CLARITY: "Career Clarity",
  RISK_AND_ADAPTABILITY_MINDSET: "Risk & Adaptability Mindset",
};

export function AssessmentView({ studentId }: { studentId: string }) {
  const { data, isLoading, error } = useAssessment(studentId);
  const confirm = useConfirmAssessment(studentId);
  const [overrideTarget, setOverrideTarget] = useState<OverrideTarget | null>(null);

  return (
    <AsyncBoundary isLoading={isLoading} error={error} data={data}>
      {(assessment) => {
        const isLocked = assessment.status === "CONFIRMED";

        return (
          <div className="space-y-6">
            <Card>
              <CardBody className="grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
                {assessment.flag && typeof assessment.gcssFinal === "number" ? (
                  <ScoreGauge score={assessment.gcssFinal} flag={assessment.flag as GcssFlag} label="GCSS" />
                ) : (
                  <div className="text-sm text-gray-500">No score yet</div>
                )}
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-semibold text-gray-900">{assessment.gcssFinal ?? "—"}</span>
                    {assessment.flag && <GcssFlagBadge flag={assessment.flag as GcssFlag} />}
                    <Badge variant="default">{assessment.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Raw {assessment.gcssRaw ?? "—"} · multiplier{" "}
                    {assessment.confidenceMultiplier?.toFixed(2) ?? "—"} · rubric v
                    {assessment.rubricVersion ?? assessment.rubricVersionId}
                  </p>
                  {assessment.aiContributionPct !== null && assessment.aiContributionPct !== undefined && (
                    <p className="mt-1 text-xs text-gray-500">
                      AI {assessment.aiContributionPct.toFixed(0)}% · advisor{" "}
                      {assessment.humanContributionPct?.toFixed(0) ?? "—"}%
                    </p>
                  )}
                </div>
                {!isLocked && (
                  <Button
                    onClick={() => confirm.mutate()}
                    loading={confirm.isPending}
                    disabled={assessment.confidenceMultiplier === null || assessment.confidenceMultiplier === undefined}
                    title={
                      assessment.confidenceMultiplier === null || assessment.confidenceMultiplier === undefined
                        ? "Cannot confirm: required documents not verified"
                        : undefined
                    }
                  >
                    Confirm assessment
                  </Button>
                )}
              </CardBody>
            </Card>

            {assessment.dimensions.map((dim) => (
              <Card key={dim.dimension}>
                <CardBody>
                  <header className="flex items-baseline justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {DIMENSION_LABELS[dim.dimension] ?? dim.dimension}
                    </h3>
                    <div className="text-right">
                      <span className="text-2xl font-semibold text-gray-900">{dim.raw.toFixed(1)}</span>
                      <span className="text-sm text-gray-500"> / {dim.max}</span>
                      {(dim.overrideDelta ?? 0) !== 0 && (
                        <div className="text-xs text-amber-700">
                          Override {(dim.overrideDelta ?? 0) > 0 ? "+" : ""}
                          {(dim.overrideDelta ?? 0).toFixed(1)}
                        </div>
                      )}
                    </div>
                  </header>

                  <ul className="mt-3 divide-y divide-gray-100 border-t border-gray-100">
                    {dim.subScores.map((s) => (
                      <li
                        key={s.subComponentKey}
                        className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 py-3 text-sm"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{s.subComponentKey}</div>
                          {s.anchorMatched && (
                            <div className="mt-0.5 text-xs text-gray-500">
                              Matched <span className="font-medium">{s.anchorMatched}</span>
                              {s.rationale ? ` · ${s.rationale}` : ""}
                            </div>
                          )}
                        </div>
                        <EvidenceLevelBadge level={s.evidenceLevel as EvidenceLevel} />
                        <div className="text-right">
                          <span className="font-medium text-gray-900">{s.raw.toFixed(1)}</span>
                          <span className="text-gray-500"> / {s.max}</span>
                        </div>
                        {!isLocked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setOverrideTarget({
                                dimension: dim.dimension as GcssDimension,
                                subComponentKey: s.subComponentKey,
                                current: s.raw,
                                max: s.max,
                                label: s.subComponentKey,
                              })
                            }
                          >
                            Override
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>

                  {dim.overrideEvidence && (
                    <p className="mt-3 rounded bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      <strong>Override evidence:</strong> {dim.overrideEvidence}
                    </p>
                  )}
                </CardBody>
              </Card>
            ))}

            {overrideTarget && (
              <OverrideDialog studentId={studentId} target={overrideTarget} onClose={() => setOverrideTarget(null)} />
            )}
          </div>
        );
      }}
    </AsyncBoundary>
  );
}
