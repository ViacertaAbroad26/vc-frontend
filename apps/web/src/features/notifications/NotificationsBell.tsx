import { Badge } from "@viacerta/ui";
import { routes } from "@viacerta/utils";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuthStore } from "@/stores/auth-store";

import { useMyNotifications } from "./useMyNotifications";
import { useNotifications } from "./useNotifications";

const ADVISOR_INBOX_ROLES = ["ADVISOR", "SENIOR_ADVISOR"];

function StudentBell() {
  const { data } = useMyNotifications();
  return <BellLink to={routes.notifications} unreadCount={data?.unreadCount ?? 0} />;
}

function AdvisorBell() {
  const { data } = useNotifications();
  return <BellLink to={routes.advisorNotifications} unreadCount={data?.unreadCount ?? 0} />;
}

function BellLink({ to, unreadCount }: { to: string; unreadCount: number }) {
  return (
    <Link to={to} className="relative inline-flex items-center text-gray-600 hover:text-gray-900" aria-label="Notifications">
      <Bell className="h-5 w-5" aria-hidden />
      {unreadCount > 0 && (
        <Badge variant="navy" className="absolute -right-2 -top-2 px-1.5 py-0 text-[10px]">
          {unreadCount > 9 ? "9+" : unreadCount}
        </Badge>
      )}
    </Link>
  );
}

export function NotificationsBell() {
  const role = useAuthStore((s) => s.user?.role);

  if (role === "STUDENT") return <StudentBell />;
  if (role && ADVISOR_INBOX_ROLES.includes(role)) return <AdvisorBell />;
  return null;
}
