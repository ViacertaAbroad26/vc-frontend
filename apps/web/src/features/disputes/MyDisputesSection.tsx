import { AsyncBoundary, Badge, Button, Card, CardBody } from "@viacerta/ui";
import { useState } from "react";

import { disputeStatusLabel, disputeStatusVariant } from "@/lib/dispute-status";

import { OpenDisputeDialog } from "./OpenDisputeDialog";
import { useMyDisputes } from "./useMyDisputes";

export function MyDisputesSection({ assessmentId }: { assessmentId: string }) {
  const { data, isLoading, error } = useMyDisputes();
  const [opening, setOpening] = useState(false);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Score disputes</h2>
        <Button variant="secondary" size="sm" onClick={() => setOpening(true)}>
          Dispute this score
        </Button>
      </div>

      <AsyncBoundary isLoading={isLoading} error={error} data={data}>
        {(result) =>
          result.items.length === 0 ? (
            <p className="text-sm text-gray-500">You haven&rsquo;t disputed your score.</p>
          ) : (
            <ul className="space-y-2">
              {result.items.map((dispute) => (
                <li key={dispute.id}>
                  <Card>
                    <CardBody>
                      <div className="flex items-center gap-2">
                        <Badge variant={disputeStatusVariant(dispute.status)}>
                          {disputeStatusLabel(dispute.status)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Opened {new Date(dispute.openedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700">{dispute.reason}</p>
                      {dispute.resolutionNotes && (
                        <p className="mt-1 text-sm text-gray-600">Advisor response: {dispute.resolutionNotes}</p>
                      )}
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          )
        }
      </AsyncBoundary>

      {opening && <OpenDisputeDialog assessmentId={assessmentId} onClose={() => setOpening(false)} />}
    </section>
  );
}
