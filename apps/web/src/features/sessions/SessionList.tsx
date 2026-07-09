import type { SessionType } from "@viacerta/api-client";
import { AsyncBoundary, Button, Card, CardBody } from "@viacerta/ui";
import { format } from "date-fns";
import { useState } from "react";

import { SESSION_TYPE_LABELS, sessionTypeLabel } from "@/lib/session-type-labels";

import { useSessions } from "./useSessions";

export function SessionList() {
  const [type, setType] = useState<SessionType | "">("");
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useSessions({
    type: type || undefined,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label htmlFor="session-type-filter" className="text-sm font-medium text-gray-700">
          Type
        </label>
        <select
          id="session-type-filter"
          value={type}
          onChange={(e) => setType(e.target.value as SessionType | "")}
          className="h-10 w-56 rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
        >
          <option value="">All types</option>
          {Object.entries(SESSION_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <AsyncBoundary isLoading={isLoading} error={error} data={data}>
        {(result) => {
          const sessions = result.pages.flatMap((p) => p.data);

          return (
            <Card>
              <CardBody className="p-0">
                <ul className="divide-y divide-gray-100">
                  {sessions.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900">{s.studentName ?? s.studentId}</div>
                        <div className="mt-0.5 text-xs text-gray-500">
                          {sessionTypeLabel(s.type)} · advisor {s.advisorName ?? s.advisorId} ·{" "}
                          {format(new Date(s.scheduledAt), "PPp")}
                          {s.parentJoined && " · parent joined"}
                        </div>
                        {s.notes && <p className="mt-1 text-xs text-gray-600">{s.notes}</p>}
                      </div>
                    </li>
                  ))}
                </ul>

                {sessions.length === 0 && (
                  <p className="py-12 text-center text-sm text-gray-500">No sessions yet.</p>
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
