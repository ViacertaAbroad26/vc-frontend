import { type PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

import { useAuthStore } from "@/stores/auth-store";

export function RoleGate({
  allow,
  children,
}: PropsWithChildren<{ allow: ReadonlyArray<string> }>) {
  const user = useAuthStore((s) => s.user);
  // SUPER_ADMIN is god-mode: it satisfies every role-gated route.
  if (!user || (user.role !== "SUPER_ADMIN" && !allow.includes(user.role))) {
    return <Navigate to="/forbidden" replace />;
  }
  return <>{children}</>;
}
