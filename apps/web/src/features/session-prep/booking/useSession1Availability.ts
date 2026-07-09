import { useQuery } from "@tanstack/react-query";
import { apiAxios, type Session1SlotsResponse } from "@viacerta/api-client";

export function useSession1Availability(date: string | undefined) {
  return useQuery({
    queryKey: ["portal", "session1-booking", "availability", date],
    queryFn: async () => {
      const { data } = await apiAxios.get<Session1SlotsResponse>(
        "/api/v1/portal/students/me/session1-booking/availability",
        { params: { date } },
      );
      return data;
    },
    enabled: !!date,
  });
}
