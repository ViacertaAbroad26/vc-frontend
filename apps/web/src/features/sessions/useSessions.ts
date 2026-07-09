import { useInfiniteQuery } from "@tanstack/react-query";
import { apiAxios, type SessionListResponse, type SessionType } from "@viacerta/api-client";

export function useSessions(filters: { type?: SessionType | undefined } = {}) {
  return useInfiniteQuery({
    queryKey: ["internal", "sessions", filters],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const { data } = await apiAxios.get<SessionListResponse>("/api/v1/internal/sessions", {
        params: { limit: 20, cursor: pageParam, type: filters.type },
      });
      return data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
