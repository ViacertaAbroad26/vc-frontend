import { routes } from "@viacerta/utils";
import { Sparkles } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/stores/auth-store";

import { PageContainer } from "./PageContainer";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const isStudent = user?.role === "STUDENT";

  return (
    <div className="fixed inset-0 flex overflow-hidden">
      <SideNav />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="min-h-0 flex-1 overflow-y-auto bg-linen-100 dark:bg-navy-900">
          <PageContainer>
            <Outlet />
          </PageContainer>
        </main>
      </div>

      {isStudent && (
        <button
          type="button"
          onClick={() => navigate(routes.aiAssistant)}
          aria-label="Open AI Assistant"
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-navy-700 text-white shadow-lg transition-transform hover:scale-105 dark:bg-mint-400 dark:text-navy-900"
        >
          <Sparkles className="h-6 w-6" aria-hidden />
        </button>
      )}
    </div>
  );
}
