import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type CreateSession1BookingRequest, type Session1BookingResponse } from "@viacerta/api-client";

export function useBookSession1() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateSession1BookingRequest) => {
      const { data } = await apiAxios.post<Session1BookingResponse>("/api/v1/portal/students/me/session1-booking", body);
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["portal", "session1-booking"], data);
      qc.invalidateQueries({ queryKey: ["portal", "session1-booking", "availability"] });
      qc.invalidateQueries({ queryKey: ["journey"] });
    },
  });
}
