import { useQuery } from "@tanstack/react-query";
import { apiAxios, type ApiComponents, type CaseListResponse } from "@viacerta/api-client";

type JourneyStateCode = ApiComponents["schemas"]["JourneyStateCode"];
type GcssFlag = ApiComponents["schemas"]["GcssFlag"];

export function useAdvisorCases(filters: {
  state: JourneyStateCode | undefined;
  flag: GcssFlag | undefined;
  orgId: string | undefined;
}) {
  return useQuery({
    queryKey: ["advisor", "cases", filters],
    queryFn: async () => {
      const { data } = await apiAxios.get<CaseListResponse>("/api/v1/advisor/cases", {
        params: { state: filters.state, flag: filters.flag, org_id: filters.orgId, limit: 50 },
      });
      return data;
    },
    refetchInterval: 30_000,
  });
}
