import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type CreateUserRequest, type UserItem } from "@viacerta/api-client";

export function useCreateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateUserRequest) => {
      const { data } = await apiAxios.post<UserItem>("/api/v1/internal/users", body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["internal", "users"] });
    },
  });
}
