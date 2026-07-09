import type { EvidenceLevel } from "@viacerta/api-client";
import { AsyncBoundary, Badge, Button, Card, CardBody, EvidenceLevelBadge } from "@viacerta/ui";
import { format } from "date-fns";
import { useState } from "react";

import { RejectDocumentForm } from "./RejectDocumentForm";
import { useStudentCaseDocuments } from "./useStudentCaseDocuments";
import { useVerifyStudentDocument } from "./useVerifyStudentDocument";
import { useViewStudentDocument } from "./useViewStudentDocument";

const EVIDENCE_LEVELS: EvidenceLevel[] = ["L2", "L3", "L4", "L5"];

export function StudentCaseDocuments({ studentId }: { studentId: string }) {
  const { data, isLoading, error } = useStudentCaseDocuments(studentId);
  const verify = useVerifyStudentDocument(studentId);
  const view = useViewStudentDocument(studentId);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  return (
    <AsyncBoundary isLoading={isLoading} error={error} data={data}>
      {(documents) => (
        <div className="space-y-3">
          {documents.length === 0 && (
            <Card>
              <CardBody className="text-center text-sm text-gray-500">No documents uploaded yet.</CardBody>
            </Card>
          )}

          {documents.map((doc) => (
            <Card key={doc.documentId}>
              <CardBody className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{doc.type}</h3>
                    <p className="mt-0.5 text-sm text-gray-600">{doc.fileName ?? "No file uploaded"}</p>
                    {doc.uploadedAt && (
                      <p className="mt-0.5 text-xs text-gray-500">Uploaded {format(new Date(doc.uploadedAt), "PP")}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{doc.status}</Badge>
                    <EvidenceLevelBadge level={doc.evidenceLevel} />
                  </div>
                </div>

                {doc.fileName && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => view.mutate(doc.documentId)}
                      disabled={view.isPending}
                    >
                      View
                    </Button>

                    {EVIDENCE_LEVELS.map((lvl) => (
                      <Button
                        key={lvl}
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => verify.mutate({ documentId: doc.documentId, evidenceLevel: lvl })}
                        disabled={verify.isPending}
                      >
                        Verify {lvl}
                      </Button>
                    ))}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-flag-red-solid hover:bg-red-50"
                      onClick={() => setRejectingId(doc.documentId)}
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {rejectingId === doc.documentId && (
                  <RejectDocumentForm
                    studentId={studentId}
                    documentId={doc.documentId}
                    onDone={() => setRejectingId(null)}
                  />
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </AsyncBoundary>
  );
}
