import { useQuery } from "@tanstack/react-query";
import { apiAxios, type UserListResponse } from "@viacerta/api-client";

export function useUsers() {
  return useQuery({
    queryKey: ["internal", "users"],
    queryFn: async () => {
      const { data } = await apiAxios.get<UserListResponse>("/api/v1/internal/users");
      return data;
    },
  });
}
