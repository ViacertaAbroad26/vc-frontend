import { useQuery } from "@tanstack/react-query";
import { apiAxios, type Session1BookingResponse } from "@viacerta/api-client";

export function useSession1Booking() {
  return useQuery({
    queryKey: ["portal", "session1-booking"],
    queryFn: async () => {
      const { data } = await apiAxios.get<Session1BookingResponse>("/api/v1/portal/students/me/session1-booking");
      return data;
    },
    retry: false,
  });
}
