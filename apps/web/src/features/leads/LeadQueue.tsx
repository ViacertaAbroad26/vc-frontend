import { AsyncBoundary, Button, Card, CardBody } from "@viacerta/ui";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

import { journeyStateLabel } from "@/lib/journey-state-labels";

import { useAdvisors } from "./useAdvisors";
import { useAssignAdvisor } from "./useAssignAdvisor";
import { useLeads } from "./useLeads";

export function LeadQueue() {
  const { data, isLoading, error } = useLeads();
  const { data: advisors } = useAdvisors();
  const assign = useAssignAdvisor();
  const [selectedAdvisors, setSelectedAdvisors] = useState<Record<string, string>>({});

  return (
    <AsyncBoundary isLoading={isLoading} error={error} data={data}>
      {(result) => (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {result.data.length} {result.data.length === 1 ? "lead" : "leads"}
          </p>

          <Card>
            <CardBody className="p-0">
              <ul className="divide-y divide-gray-100">
                {result.data.map((lead) => (
                  <li key={lead.studentId} className="flex flex-wrap items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900">{lead.fullName}</div>
                      <div className="mt-0.5 text-xs text-gray-500">
                        {journeyStateLabel(lead.currentState)}
                        {lead.createdAt &&
                          ` · registered ${formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}`}
                        {lead.advisorName && ` · advisor ${lead.advisorName}`}
                      </div>
                    </div>
                    <select
                      aria-label={`Assign advisor to ${lead.fullName}`}
                      value={selectedAdvisors[lead.studentId] ?? ""}
                      onChange={(e) =>
                        setSelectedAdvisors((prev) => ({ ...prev, [lead.studentId]: e.target.value }))
                      }
                      className="h-10 w-48 rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
                    >
                      <option value="">Select advisor…</option>
                      {advisors?.data.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.fullName}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={!selectedAdvisors[lead.studentId]}
                      loading={assign.isPending && assign.variables?.studentId === lead.studentId}
                      onClick={() =>
                        assign.mutate({ studentId: lead.studentId, advisorId: selectedAdvisors[lead.studentId]! })
                      }
                    >
                      Assign
                    </Button>
                  </li>
                ))}
              </ul>

              {result.data.length === 0 && (
                <p className="py-12 text-center text-sm text-gray-500">No unassigned leads.</p>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </AsyncBoundary>
  );
}
