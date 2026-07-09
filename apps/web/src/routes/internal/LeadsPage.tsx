import { PageHeader, Tabs, TabsContent, TabsList, TabsTrigger } from "@viacerta/ui";

import { LeadQueue } from "@/features/leads/LeadQueue";
import { SessionList } from "@/features/sessions/SessionList";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Leads" description="New sign-ups awaiting assignment." />

      <Tabs defaultValue="leads">
        <TabsList>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="leads">
          <LeadQueue />
        </TabsContent>
        <TabsContent value="sessions">
          <SessionList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
