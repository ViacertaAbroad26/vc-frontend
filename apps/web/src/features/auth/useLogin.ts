import { useMutation } from "@tanstack/react-query";
import { apiAxios, authStorage, type AuthEnvelope } from "@viacerta/api-client";
import { useLocation, useNavigate } from "react-router-dom";

import { destinationByRole } from "@/lib/destination-by-role";
import { useAuthStore } from "@/stores/auth-store";

type LoginBody = {
  email: string;
  password: string;
};

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (body: LoginBody): Promise<AuthEnvelope> => {
      const { data } = await apiAxios.post<AuthEnvelope>("/api/v1/auth/login", body);
      return data;
    },
    onSuccess: (resp) => {
      authStorage.setTokens(resp.tokens);
      setUser({ ...resp.user, studentId: resp.user.studentId ?? null, orgId: resp.user.orgId ?? null });
      const from =
        (location.state as { from?: string } | null)?.from ??
        destinationByRole(resp.user.role, resp.user.studentId);
      navigate(from, { replace: true });
    },
  });
}
