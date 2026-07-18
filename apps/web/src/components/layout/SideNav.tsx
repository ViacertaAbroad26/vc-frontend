import { cn, Logo } from "@viacerta/ui";
import { routes } from "@viacerta/utils";
import {
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardList,
  Database,
  FileCheck,
  FileText,
  Home,
  LayoutDashboard,
  Lock,
  Map,
  MessageSquare,
  Sliders,
  Sparkles,
  TrendingUp,
  User,
  UserCog,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { useJourney } from "@/features/journey/use-journey";
import { useMessageThread } from "@/features/messages/useMessageThread";
import { JOURNEY_STAGE_LABELS } from "@/lib/journey-stages";
import {
  ADMIN_ONLY,
  ADVISOR_ROLES,
  CAREER_ROLES,
  COORD_ROLES,
  DATA_OPS_ROLES,
  DOCS_OPS_ROLES,
  SENIOR_ROLES,
  SUPER_ADMIN_ONLY,
} from "@/lib/roles";
import { useAuthStore } from "@/stores/auth-store";

// Student MENU section (matches design-system SideNav grouping).
const STUDENT_MENU_ITEMS = [
  { to: routes.dashboard, label: "Dashboard", icon: Home },
  { to: routes.journey, label: "My Journey", icon: Map },
] as const;

// Student WORKSPACE section — existing functional routes, regrouped.
const STUDENT_WORKSPACE_ITEMS = [
  { to: routes.profile, label: "My profile", icon: User },
  { to: routes.intakeStart, label: "Intake", icon: ClipboardList },
  { to: routes.documents, label: "Documents", icon: FileText },
  { to: routes.report, label: "Report", icon: BarChart3 },
  { to: routes.decision, label: "Decision", icon: CheckCircle2 },
  { to: routes.mySessionPrep, label: "Session 1 prep", icon: Calendar },
  { to: routes.notifications, label: "Notifications", icon: Bell },
  { to: routes.messages, label: "Messages", icon: MessageSquare },
  { to: routes.aiAssistant, label: "AI Assistant", icon: Sparkles },
  { to: routes.achievements, label: "Achievements", icon: Award },
  { to: routes.analytics, label: "Analytics", icon: TrendingUp },
] as const;

const NAV_ITEMS = [
  { to: routes.admin, label: "Overview", icon: LayoutDashboard, allow: SUPER_ADMIN_ONLY },

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

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  badge,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
  badge?: number | undefined;
}) {
  return (
    <li>
      <NavLink
        to={to}
        end={end ?? false}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            isActive ? "bg-mint-400 text-navy-900" : "text-white/75 hover:bg-white/10 hover:text-white",
          )
        }
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden />
        <span className="truncate">{label}</span>
        {!!badge && (
          <span className="ml-auto shrink-0 rounded-full bg-mint-400 px-1.5 py-0 text-[10px] font-semibold text-navy-900">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </NavLink>
    </li>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-white/40">
      {children}
    </p>
  );
}

export function SideNav() {
  const user = useAuthStore((s) => s.user);
  const isStudent = user?.role === "STUDENT";
  const { data: journey } = useJourney({ enabled: isStudent });
  const { data: messageThread } = useMessageThread({ enabled: isStudent });

  if (!user) return null;

  const items = NAV_ITEMS.filter((item) => {
    // SUPER_ADMIN's god-mode bypass doesn't apply to the student's own
    // dashboard items: SUPER_ADMIN has no `students` record, so
    // `/api/v1/portal/students/me/*` 404s for them.
    return user.role === "SUPER_ADMIN" || (item.allow as readonly string[]).includes(user.role);
  });

  const currentStage = journey?.currentStage ?? 0;

  return (
    <nav className="hidden h-full w-64 shrink-0 flex-col bg-navy-700 md:flex">
      <div className="px-6 py-7">
        <Logo inverted tagline />
      </div>

      <div className="mx-6 border-t border-white/10" />

      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {isStudent && (
          <>
            <SectionLabel>Menu</SectionLabel>
            {STUDENT_MENU_ITEMS.map((item) => (
              <NavItem key={item.to} {...item} end={item.to === routes.dashboard} />
            ))}

            <SectionLabel>The Journey</SectionLabel>
            {JOURNEY_STAGE_LABELS.map((stage) => {
              const status = stage.stage < currentStage ? "done" : stage.stage === currentStage ? "current" : "locked";
              const to = stage.stage === 0 ? routes.stage(0) : routes.stage(stage.stage);
              const isLocked = status === "locked";
              return (
                <li key={stage.stage}>
                  <NavLink
                    to={isLocked ? "#" : to}
                    onClick={(e) => isLocked && e.preventDefault()}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                        isLocked && "cursor-not-allowed text-white/35",
                        !isLocked && isActive
                          ? "bg-mint-400 text-navy-900"
                          : !isLocked && "text-white/75 hover:bg-white/10 hover:text-white",
                      )
                    }
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                        status === "done" && "border-mint-400 bg-mint-400 text-navy-900",
                        status === "current" && "border-white bg-white text-navy-900",
                        status === "locked" && "border-white/20 text-white/40",
                      )}
                    >
                      {status === "done" ? (
                        <Check className="h-3 w-3" aria-hidden />
                      ) : status === "locked" ? (
                        <Lock className="h-3 w-3" aria-hidden />
                      ) : (
                        stage.stage
                      )}
                    </span>
                    <span className="truncate">
                      Stage {stage.stage} · {stage.label}
                    </span>
                  </NavLink>
                </li>
              );
            })}

            <SectionLabel>Workspace</SectionLabel>
            {STUDENT_WORKSPACE_ITEMS.map((item) => (
              <NavItem
                key={item.to}
                {...item}
                badge={item.to === routes.messages ? messageThread?.unreadCount : undefined}
              />
            ))}
          </>
        )}

        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={`${item.to}-${item.label}`}>
              <NavLink
                to={item.to}
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
