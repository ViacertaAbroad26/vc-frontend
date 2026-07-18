import { Badge, Button, Chip } from "@viacerta/ui";
import { routes } from "@viacerta/utils";
import { Globe2, Moon, Search, Sun } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useStudentReport } from "@/features/report/useStudentReport";
import { NotificationsBell } from "@/features/notifications/NotificationsBell";
import { ADVISOR_ROLES, STUDENT_ROLES } from "@/lib/roles";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";

export function TopBar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const isStudent = user?.role === "STUDENT";
  const { data: report } = useStudentReport({ enabled: isStudent });
  const topCountry = report?.gcri?.[0]?.country;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const canSearchCases = user && (ADVISOR_ROLES as readonly string[]).includes(user.role);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSearchCases) return;
    const query = search.trim();
    navigate(query ? `${routes.cases}?q=${encodeURIComponent(query)}` : routes.cases);
  };

  const showRole = user && user.role !== "STUDENT" && user.role !== "PARENT";
  const firstName = user?.fullName.split(" ")[0];
  const subtitle =
    user && (STUDENT_ROLES as readonly string[]).includes(user.role)
      ? "Track your application journey and next steps"
      : "Stay on top of today's priorities";
  const initials = user?.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="flex h-[72px] items-center gap-6 border-b border-navy-100 bg-white px-6 dark:border-navy-700 dark:bg-navy-800 md:px-8">
      {user && (
        <div className="min-w-0 shrink-0">
          <h1 className="truncate font-heading text-lg font-semibold text-navy-900 dark:text-gray-50">
            Welcome back, {firstName}
          </h1>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
      )}

      <div className="flex flex-1 justify-center px-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search"
            className="h-10 w-full rounded-xl border border-transparent bg-linen-100 pl-9 pr-3 text-sm text-gray-600 placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-navy-200 dark:bg-navy-700 dark:text-gray-200 dark:placeholder:text-gray-500"
          />
        </form>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        {isStudent && topCountry && <Chip icon={Globe2}>{topCountry}</Chip>}
        {isStudent && report && (
          <Badge variant="mint" className="hidden sm:inline-flex">
            Readiness {Math.round(report.gcss.total)}
          </Badge>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-linen-100 text-gray-600 transition-colors hover:text-navy-700 dark:bg-navy-700 dark:text-gray-300 dark:hover:text-mint-400"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {user && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linen-100 dark:bg-navy-700">
            <NotificationsBell />
          </div>
        )}

        {user && (
          <>
            <div className="h-8 w-px bg-navy-100 dark:bg-navy-700" />

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-700 text-sm font-semibold text-white dark:bg-mint-400 dark:text-navy-900">
                {initials}
              </div>
              <div className="hidden flex-col items-start leading-tight sm:flex">
                <span className="text-sm font-medium text-navy-900 dark:text-gray-50">{user.fullName}</span>
                {showRole && (
                  <Badge variant="mint" className="mt-0.5">
                    {user.role}
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
