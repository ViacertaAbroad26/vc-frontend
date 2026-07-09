import { PageHeader, Tabs, TabsContent, TabsList, TabsTrigger } from "@viacerta/ui";

import { BulkOutcomeImportForm } from "@/features/outcomes/BulkOutcomeImportForm";
import { OutcomeCaptureForm } from "@/features/outcomes/OutcomeCaptureForm";
import { OutcomeCoverageView } from "@/features/outcomes/OutcomeCoverageView";

export default function OutcomesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Outcomes" description="Track student outcomes over time." />

      <Tabs defaultValue="coverage">
        <TabsList>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="capture">Capture outcome</TabsTrigger>
          <TabsTrigger value="bulk-import">Bulk import</TabsTrigger>
        </TabsList>
        <TabsContent value="coverage">
          <OutcomeCoverageView />
        </TabsContent>
        <TabsContent value="capture">
          <OutcomeCaptureForm />
        </TabsContent>
        <TabsContent value="bulk-import">
          <BulkOutcomeImportForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
