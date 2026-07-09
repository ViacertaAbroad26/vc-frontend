import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios, type UserItem, type UserRole } from "@viacerta/api-client";

export function useChangeUserRole() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { data } = await apiAxios.patch<UserItem>(`/api/v1/internal/users/${userId}/role`, { role });
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["internal", "users"] });
    },
  });
}
