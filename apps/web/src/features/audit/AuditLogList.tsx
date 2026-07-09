import type { AuditAction } from "@viacerta/api-client";
import { AsyncBoundary, Badge, Button, Card, CardBody } from "@viacerta/ui";
import { format } from "date-fns";
import { useState } from "react";

import { AUDIT_ACTIONS, auditActionLabel } from "@/lib/audit-action-labels";

import { useAuditLogs } from "./useAuditLogs";

export function AuditLogList() {
  const [entityType, setEntityType] = useState("");
  const [action, setAction] = useState<AuditAction | "">("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useAuditLogs({
    entityType: entityType || undefined,
    action: action || undefined,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="audit-entity-type" className="block text-sm font-medium text-gray-700">
            Entity type
          </label>
          <input
            id="audit-entity-type"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            placeholder="e.g. STUDENT"
            className="mt-1 h-10 w-48 rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
          />
        </div>
        <div>
          <label htmlFor="audit-action" className="block text-sm font-medium text-gray-700">
            Action
          </label>
          <select
            id="audit-action"
            value={action}
            onChange={(e) => setAction(e.target.value as AuditAction | "")}
            className="mt-1 h-10 w-56 rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
          >
            <option value="">All actions</option>
            {AUDIT_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {auditActionLabel(a)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AsyncBoundary isLoading={isLoading} error={error} data={data}>
        {(result) => {
          const entries = result.pages.flatMap((p) => p.data);

          return (
            <Card>
              <CardBody className="p-0">
                <ul className="divide-y divide-gray-100">
                  {entries.map((entry) => (
                    <li key={entry.id} className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="navy">{auditActionLabel(entry.action)}</Badge>
                        <span className="text-sm text-gray-700">
                          {entry.entityType} · {entry.entityId}
                        </span>
                        <span className="ml-auto text-xs text-gray-500">
                          {format(new Date(entry.createdAt), "PPp")}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {entry.actorId && <>actor {entry.actorId}</>}
                        {entry.evidence && <> · {entry.evidence}</>}
                      </div>

                      {(entry.before || entry.after) && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                            className="text-xs font-medium text-navy-600 hover:underline"
                          >
                            {expandedId === entry.id ? "Hide details" : "Show details"}
                          </button>
                          {expandedId === entry.id && (
                            <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                              {entry.before && (
                                <div>
                                  <div className="font-medium text-gray-700">Before</div>
                                  <pre className="mt-1 overflow-x-auto rounded bg-gray-50 p-2">
                                    {JSON.stringify(entry.before, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {entry.after && (
                                <div>
                                  <div className="font-medium text-gray-700">After</div>
                                  <pre className="mt-1 overflow-x-auto rounded bg-gray-50 p-2">
                                    {JSON.stringify(entry.after, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                {entries.length === 0 && (
                  <p className="py-12 text-center text-sm text-gray-500">No audit entries yet.</p>
                )}
              </CardBody>
            </Card>
          );
        }}
      </AsyncBoundary>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="secondary" size="sm" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
