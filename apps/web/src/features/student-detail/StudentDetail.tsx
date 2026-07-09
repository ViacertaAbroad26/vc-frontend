import type { GcssFlag } from "@viacerta/design-tokens";
import { AsyncBoundary, Badge, Button, Card, CardBody, GcssFlagBadge } from "@viacerta/ui";
import { routes } from "@viacerta/utils";
import { useState } from "react";
import { Link } from "react-router-dom";

import { auditEntryDescription } from "@/lib/audit-action-labels";
import { journeyStateLabel } from "@/lib/journey-state-labels";

import { AdvanceStageDialog } from "./AdvanceStageDialog";
import { StageTracker } from "./StageTracker";
import { useStudentDetail } from "./useStudentDetail";

export function StudentDetail({ studentId }: { studentId: string }) {
  const { data, isLoading, error } = useStudentDetail(studentId);
  const [advanceOpen, setAdvanceOpen] = useState(false);

  return (
    <AsyncBoundary isLoading={isLoading} error={error} data={data}>
      {(student) => (
        <div className="space-y-6">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{student.fullName}</h1>
              <p className="mt-1 text-sm text-gray-600">
                {student.email ?? "—"} · {student.persona ?? "—"}
              </p>
              {student.targetCountries && student.targetCountries.length > 0 && (
                <p className="mt-1 text-sm text-gray-600">
                  Target countries: {student.targetCountries.join(", ")}
                </p>
              )}
              {student.careerGoal && <p className="mt-1 text-sm text-gray-600">Career goal: {student.careerGoal}</p>}
            </div>
            <div className="text-right text-sm">
              <div className="text-gray-500">Current stage</div>
              <Badge variant="navy">{journeyStateLabel(student.currentState)}</Badge>
            </div>
          </header>

          <section className="flex flex-wrap items-center justify-between gap-4">
            <StageTracker currentState={student.currentState} />
            <Button variant="secondary" size="sm" onClick={() => setAdvanceOpen(true)}>
              Advance stage
            </Button>
          </section>

          {advanceOpen && <AdvanceStageDialog studentId={studentId} onClose={() => setAdvanceOpen(false)} />}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link to={routes.assessment(studentId)}>
              <Card className="h-full hover:border-navy-300">
                <CardBody>
                  <h3 className="font-medium text-gray-900">Assessment</h3>
                  {student.assessment ? (
                    <AssessmentSummary assessment={student.assessment} />
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">Not yet available.</p>
                  )}
                </CardBody>
              </Card>
            </Link>

            <Link to={routes.gcri(studentId)}>
              <Card className="h-full hover:border-navy-300">
                <CardBody>
                  <h3 className="font-medium text-gray-900">Country risk</h3>
                  <p className="mt-1 text-sm text-gray-500">View GCRI results, trigger a run.</p>
                </CardBody>
              </Card>
            </Link>

            <Link to={routes.sessionPrep(studentId)}>
              <Card className="h-full hover:border-navy-300">
                <CardBody>
                  <h3 className="font-medium text-gray-900">Session 1 prep</h3>
                  <p className="mt-1 text-sm text-gray-500">Review and approve AI-drafted Session 1 questions.</p>
                </CardBody>
              </Card>
            </Link>

            <Link to={routes.countryMapping(studentId)}>
              <Card className="h-full hover:border-navy-300">
                <CardBody>
                  <h3 className="font-medium text-gray-900">Country mapping</h3>
                  <p className="mt-1 text-sm text-gray-500">Stage 2 · Confirm target country shortlist.</p>
                </CardBody>
              </Card>
            </Link>

            <Link to={routes.universitySelection(studentId)}>
              <Card className="h-full hover:border-navy-300">
                <CardBody>
                  <h3 className="font-medium text-gray-900">University selection</h3>
                  <p className="mt-1 text-sm text-gray-500">Stage 3 · Build the university/program shortlist.</p>
                </CardBody>
              </Card>
            </Link>

            <Link to={routes.documentPrep(studentId)}>
              <Card className="h-full hover:border-navy-300">
                <CardBody>
                  <h3 className="font-medium text-gray-900">Document prep</h3>
                  <p className="mt-1 text-sm text-gray-500">Stage 4 · Confirm the document readiness checklist.</p>
                </CardBody>
              </Card>
            </Link>

            <Link to={routes.applicationTracker(studentId)}>
              <Card className="h-full hover:border-navy-300">
                <CardBody>
                  <h3 className="font-medium text-gray-900">Applications &amp; visa</h3>
                  <p className="mt-1 text-sm text-gray-500">Stage 5 · Track applications and visa status.</p>
                </CardBody>
              </Card>
            </Link>

            <Link to={routes.preDeparture(studentId)}>
              <Card className="h-full hover:border-navy-300">
                <CardBody>
                  <h3 className="font-medium text-gray-900">Pre-departure</h3>
                  <p className="mt-1 text-sm text-gray-500">Stage 6 · Confirm pre-departure readiness.</p>
                </CardBody>
              </Card>
            </Link>

            <Link to={routes.placement(studentId)}>
              <Card className="h-full hover:border-navy-300">
                <CardBody>
                  <h3 className="font-medium text-gray-900">Placement</h3>
                  <p className="mt-1 text-sm text-gray-500">Stage 7 · Confirm placement and complete the journey.</p>
                </CardBody>
              </Card>
            </Link>

            <Link to={routes.reportBuilder(studentId)}>
              <Card className="h-full hover:border-navy-300">
                <CardBody>
                  <h3 className="font-medium text-gray-900">Report builder</h3>
                  <p className="mt-1 text-sm text-gray-500">Write insights and publish.</p>
                </CardBody>
              </Card>
            </Link>
          </div>

          {student.documents && student.documents.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {student.documents.map((doc, i) => (
                  <Card key={i}>
                    <CardBody className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-gray-900">
                        {"type" in doc ? String(doc.type) : "Document"}
                      </span>
                      <span className="text-gray-600">{"status" in doc ? String(doc.status) : ""}</span>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {student.auditSummary && student.auditSummary.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Recent activity</h2>
              <Card>
                <CardBody>
                  <ul className="divide-y divide-gray-100 text-sm">
                    {student.auditSummary.map((entry, i) => {
                      const createdAt = "created_at" in entry ? entry.created_at : null;
                      return (
                        <li key={i} className="flex items-center justify-between gap-3 py-2 text-gray-700">
                          <span>{auditEntryDescription(entry)}</span>
                          {typeof createdAt === "string" && (
                            <span className="shrink-0 text-xs text-gray-400">
                              {new Date(createdAt).toLocaleString()}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </CardBody>
              </Card>
            </section>
          )}
        </div>
      )}
    </AsyncBoundary>
  );
}

function AssessmentSummary({ assessment }: { assessment: Record<string, unknown> }) {
  const gcssFinal = "gcssFinal" in assessment ? assessment.gcssFinal : null;
  const flag = "gcssFlag" in assessment ? assessment.gcssFlag : null;
  const status = "status" in assessment ? assessment.status : null;

  return (
    <div className="mt-2 flex items-center gap-2">
      {typeof gcssFinal === "number" && <span className="text-lg font-semibold text-gray-900">{gcssFinal}</span>}
      {typeof flag === "string" && <GcssFlagBadge flag={flag as GcssFlag} />}
      {typeof status === "string" && <span className="text-xs text-gray-500">{status}</span>}
    </div>
  );
}
