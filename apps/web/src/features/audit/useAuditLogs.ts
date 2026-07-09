import { useInfiniteQuery } from "@tanstack/react-query";
import { apiAxios, type AuditAction, type AuditLogListResponse } from "@viacerta/api-client";

export function useAuditLogs(filters: { entityType?: string | undefined; action?: AuditAction | undefined } = {}) {
  return useInfiniteQuery({
    queryKey: ["internal", "audit-logs", filters],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const { data } = await apiAxios.get<AuditLogListResponse>("/api/v1/internal/audit-logs", {
        params: { limit: 20, cursor: pageParam, entity_type: filters.entityType, action: filters.action },
      });
      return data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
