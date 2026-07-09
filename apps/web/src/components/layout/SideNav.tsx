import { cn, Logo } from "@viacerta/ui";
import { routes } from "@viacerta/utils";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Database,
  FileCheck,
  FileText,
  Home,
  LayoutDashboard,
  Map,
  Sliders,
  TrendingUp,
  User,
  UserCog,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  ADMIN_ONLY,
  ADVISOR_ROLES,
  CAREER_ROLES,
  COORD_ROLES,
  DATA_OPS_ROLES,
  DOCS_OPS_ROLES,
  SENIOR_ROLES,
  STUDENT_ROLES,
  SUPER_ADMIN_ONLY,
} from "@/lib/roles";
import { useAuthStore } from "@/stores/auth-store";

const NAV_ITEMS = [
  { to: routes.admin, label: "Overview", icon: LayoutDashboard, allow: SUPER_ADMIN_ONLY },

  { to: routes.dashboard, label: "Dashboard", icon: Home, allow: STUDENT_ROLES },
  { to: routes.profile, label: "My profile", icon: User, allow: STUDENT_ROLES },
  { to: routes.journey, label: "Journey", icon: Map, allow: STUDENT_ROLES },
  { to: routes.intakeStart, label: "Intake", icon: ClipboardList, allow: STUDENT_ROLES },
  { to: routes.documents, label: "Documents", icon: FileText, allow: STUDENT_ROLES },
  { to: routes.report, label: "Report", icon: BarChart3, allow: STUDENT_ROLES },
  { to: routes.decision, label: "Decision", icon: CheckCircle2, allow: STUDENT_ROLES },
  { to: routes.mySessionPrep, label: "Session 1 prep", icon: Calendar, allow: STUDENT_ROLES },
  { to: routes.notifications, label: "Notifications", icon: Bell, allow: STUDENT_ROLES },

  { to: routes.cases, label: "Case queue", icon: Briefcase, allow: ADVISOR_ROLES },
  { to: routes.disputes, label: "Disputes", icon: AlertTriangle, allow: ADVISOR_ROLES },
  {
    to: routes.calibration,
    label: "Calibration",
    icon: Sliders,
    allow: [...SENIOR_ROLES, ...ADVISOR_ROLES],
  },
  { to: routes.advisorNotifications, label: "Notifications", icon: Bell, allow: ADVISOR_ROLES },

  { to: routes.leads, label: "Leads", icon: Users, allow: COORD_ROLES },
  { to: routes.documentVerify, label: "Document verify", icon: FileCheck, allow: DOCS_OPS_ROLES },
  { to: routes.dataOps, label: "Data ops", icon: Database, allow: DATA_OPS_ROLES },
  { to: routes.outcomes, label: "Outcomes", icon: TrendingUp, allow: CAREER_ROLES },
  { to: routes.users, label: "Users", icon: UserCog, allow: ADMIN_ONLY },
  { to: routes.organizations, label: "Branches", icon: Building2, allow: SUPER_ADMIN_ONLY },
] as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function SideNav() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const items = NAV_ITEMS.filter((item) => {
    // SUPER_ADMIN's god-mode bypass doesn't apply to the student's own
    // dashboard items: SUPER_ADMIN has no `students` record, so
    // `/api/v1/portal/students/me/*` 404s for them.
    if (item.allow === STUDENT_ROLES) return (item.allow as readonly string[]).includes(user.role);
    return user.role === "SUPER_ADMIN" || (item.allow as readonly string[]).includes(user.role);
  });

  return (
    <nav className="hidden h-full w-64 shrink-0 flex-col bg-navy-700 md:flex">
      <div className="px-6 py-7">
        <Logo inverted tagline />
      </div>

      <div className="mx-6 border-t border-white/10" />

      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={`${item.to}-${item.label}`}>
              <NavLink
                to={item.to}
                end={item.to === routes.dashboard}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-mint-400 text-navy-900"
                      : "text-white/75 hover:bg-white/10 hover:text-white",
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                <span className="truncate">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="mx-4 mb-5 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint-400 text-sm font-semibold text-navy-900">
          {getInitials(user.fullName)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{user.fullName}</p>
          <p className="truncate text-xs text-white/60">{user.role}</p>
        </div>
      </div>
    </nav>
  );
}
