import { useQuery } from "@tanstack/react-query";
import { apiAxios, type ApiComponents } from "@viacerta/api-client";

export type Analytics = ApiComponents["schemas"]["AnalyticsResponse"];

export function useAnalytics() {
  return useQuery({
    queryKey: ["studentAnalytics"],
    queryFn: async () => {
      const { data } = await apiAxios.get<Analytics>("/api/v1/portal/students/me/analytics");
      return data;
    },
  });
}
