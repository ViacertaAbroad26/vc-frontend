import type { EvidenceLevel } from "@viacerta/api-client";
import { AsyncBoundary, Badge, Button, Card, CardBody } from "@viacerta/ui";
import { format } from "date-fns";
import { useState } from "react";

import { RejectForm } from "./RejectForm";
import { usePendingDocuments } from "./usePendingDocuments";
import { useVerifyDocument } from "./useVerifyDocument";

const EVIDENCE_LEVELS: EvidenceLevel[] = ["L2", "L3", "L4", "L5"];

export function DocumentQueue() {
  const { data, isLoading, error } = usePendingDocuments();
  const verify = useVerifyDocument();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);

  return (
    <AsyncBoundary isLoading={isLoading} error={error} data={data}>
      {(result) => {
        const current = result.data.find((d) => d.documentId === selectedId) ?? result.data[0];

        const groups = new Map<string, { label: string; documents: typeof result.data }>();
        for (const d of result.data) {
          const key = d.studentId;
          const group = groups.get(key);
          if (group) {
            group.documents.push(d);
          } else {
            groups.set(key, { label: d.studentName ?? d.studentId, documents: [d] });
          }
        }

        return (
          <div className="grid gap-4 md:grid-cols-[320px_1fr]">
            <Card>
              <CardBody className="p-0">
                {[...groups.values()].map((group) => (
                  <div key={group.label} className="border-b border-gray-100 last:border-b-0">
                    <div className="bg-gray-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {group.label}
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {group.documents.map((d) => (
                        <li key={d.documentId}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedId(d.documentId);
                              setShowReject(false);
                            }}
                            className={`block w-full p-3 text-left text-sm hover:bg-gray-50 ${
                              current?.documentId === d.documentId ? "bg-navy-50" : ""
                            }`}
                          >
                            <div className="font-medium text-gray-900">{d.type}</div>
                            <div className="mt-0.5 text-xs text-gray-500">
                              {d.fileName}
                              {d.uploadedAt && ` · uploaded ${format(new Date(d.uploadedAt), "PP")}`}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {result.data.length === 0 && (
                  <p className="p-6 text-center text-sm text-gray-500">Queue is empty.</p>
                )}
              </CardBody>
            </Card>

            {current && (
              <Card>
                <CardBody className="space-y-4">
                  <header className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-gray-900">{current.type}</h2>
                      <p className="text-sm text-gray-600">{current.studentName ?? current.studentId}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{current.fileName}</p>
                    </div>
                    <Badge>{current.evidenceLevel}</Badge>
                  </header>

                  <div>
                    <p className="block text-sm font-medium text-gray-700">Verify at evidence level</p>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {EVIDENCE_LEVELS.map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => verify.mutate({ documentId: current.documentId, evidenceLevel: lvl })}
                          className="rounded border border-gray-300 px-3 py-2 text-sm hover:border-navy-500 hover:bg-navy-50"
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      L5 = original verified · L4 = certified copy · L3 = self-uploaded readable · L2 =
                      unclear/incomplete
                    </p>
                  </div>

                  {!showReject ? (
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <Button
                        variant="ghost"
                        className="text-flag-red-solid hover:bg-red-50"
                        onClick={() => setShowReject(true)}
                      >
                        Reject document
                      </Button>
                    </div>
                  ) : (
                    <RejectForm documentId={current.documentId} onDone={() => setShowReject(false)} />
                  )}
                </CardBody>
              </Card>
            )}
          </div>
        );
      }}
    </AsyncBoundary>
  );
}
