import { PageHeader, Tabs, TabsContent, TabsList, TabsTrigger } from "@viacerta/ui";

import { AuditLogList } from "@/features/audit/AuditLogList";
import { UserDirectory } from "@/features/users/UserDirectory";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage advisor and internal accounts." />

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UserDirectory />
        </TabsContent>
        <TabsContent value="audit">
          <AuditLogList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
