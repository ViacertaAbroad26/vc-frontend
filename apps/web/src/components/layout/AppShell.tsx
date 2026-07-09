import { Outlet } from "react-router-dom";

import { PageContainer } from "./PageContainer";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";

export function AppShell() {
  return (
    <div className="fixed inset-0 flex overflow-hidden">
      <SideNav />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="min-h-0 flex-1 overflow-y-auto bg-linen-100">
          <PageContainer>
            <Outlet />
          </PageContainer>
        </main>
      </div>
    </div>
  );
}
