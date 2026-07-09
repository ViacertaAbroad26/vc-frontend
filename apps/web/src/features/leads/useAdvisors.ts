import { useQuery } from "@tanstack/react-query";
import { apiAxios, type UserListResponse } from "@viacerta/api-client";

export function useAdvisors() {
  return useQuery({
    queryKey: ["internal", "users", "advisors"],
    queryFn: async () => {
      const { data } = await apiAxios.get<UserListResponse>("/api/v1/internal/users/advisors");
      return data;
    },
  });
}
