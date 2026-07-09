import { useQuery } from "@tanstack/react-query";
import { apiAxios, type ProfileChangeRequest } from "@viacerta/api-client";

export function useProfileChangeRequests() {
  return useQuery({
    queryKey: ["portal", "profile", "change-requests"],
    queryFn: async () => {
      const { data } = await apiAxios.get<ProfileChangeRequest[]>(
        "/api/v1/portal/students/me/profile/change-requests",
      );
      return data;
    },
  });
}
