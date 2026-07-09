import type { DisputeResponse, DisputeStatus } from "@viacerta/api-client";
import { AsyncBoundary, Badge, Button, Card, CardBody, cn } from "@viacerta/ui";
import { routes } from "@viacerta/utils";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { disputeStatusLabel, disputeStatusVariant } from "@/lib/dispute-status";

import { ResolveDisputeDialog } from "./ResolveDisputeDialog";
import { useDisputes } from "./useDisputes";

const STATUSES: { value: DisputeStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "RESOLVED_KEPT", label: "Resolved · kept" },
  { value: "RESOLVED_REASSESS", label: "Resolved · reassess" },
];

export function DisputesQueueView() {
  const [params, setParams] = useSearchParams();
  const status = (params.get("status") ?? "ALL") as DisputeStatus | "ALL";
  const [resolving, setResolving] = useState<DisputeResponse | null>(null);

  const { data, isLoading, error } = useDisputes(status === "ALL" ? undefined : status);

  const setStatus = (value: DisputeStatus | "ALL") => {
    const next = new URLSearchParams(params);
    if (value === "ALL") next.delete("status");
    else next.set("status", value);
    setParams(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setStatus(s.value)}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1 text-xs",
              status === s.value ? "bg-navy-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <AsyncBoundary isLoading={isLoading} error={error} data={data}>
        {(result) => (
          <>
            <p className="text-sm text-gray-600">
              {result.items.length} {result.items.length === 1 ? "dispute" : "disputes"}
            </p>

            <ul className="space-y-2">
              {result.items.map((dispute) => (
                <li key={dispute.id}>
                  <Card>
                    <CardBody className="flex flex-wrap items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link to={routes.assessment(dispute.studentId)} className="font-medium text-navy-700 hover:underline">
                            {dispute.studentName ?? `Student ${dispute.studentId}`}
                          </Link>
                          <Badge variant={disputeStatusVariant(dispute.status)}>
                            {disputeStatusLabel(dispute.status)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-gray-700">{dispute.reason}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          Opened {new Date(dispute.openedAt).toLocaleDateString()}
                        </p>
                        {dispute.resolutionNotes && (
                          <p className="mt-1 text-xs text-gray-500">Resolution notes: {dispute.resolutionNotes}</p>
                        )}
                      </div>
                      {dispute.status === "OPEN" && (
                        <Button size="sm" onClick={() => setResolving(dispute)}>
                          Resolve
                        </Button>
                      )}
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>

            {result.items.length === 0 && (
              <p className="py-12 text-center text-sm text-gray-500">No disputes match this filter.</p>
            )}
          </>
        )}
      </AsyncBoundary>

      {resolving && <ResolveDisputeDialog dispute={resolving} onClose={() => setResolving(null)} />}
    </div>
  );
}
