import { useMutation } from "@tanstack/react-query";
import { apiAxios, authStorage, type AuthEnvelope } from "@viacerta/api-client";
import { useNavigate } from "react-router-dom";

import { destinationByRole } from "@/lib/destination-by-role";
import { useAuthStore } from "@/stores/auth-store";

type RegisterBody = {
  email: string;
  password: string;
  fullName: string;
  role?: "STUDENT" | "PARENT";
};

export function useRegister() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (body: RegisterBody): Promise<AuthEnvelope> => {
      const { data } = await apiAxios.post<AuthEnvelope>("/api/v1/auth/register", body);
      return data;
    },
    onSuccess: (resp) => {
      authStorage.setTokens(resp.tokens);
      setUser({ ...resp.user, studentId: resp.user.studentId ?? null, orgId: resp.user.orgId ?? null });
      navigate(destinationByRole(resp.user.role, resp.user.studentId), { replace: true });
    },
  });
}
