import { Navigate } from "react-router-dom";

import { destinationByRole } from "@/lib/destination-by-role";
import DashboardPage from "@/routes/student/DashboardPage";
import { useAuthStore } from "@/stores/auth-store";


/** Landing route ("/"): students see the dashboard, everyone else is redirected by role. */
export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  if (!user || user.role === "STUDENT") {
    return <DashboardPage />;
  }
  return <Navigate to={destinationByRole(user.role, user.studentId)} replace />;
}
