import { Card, CardBody, Tabs, TabsContent, TabsList, TabsTrigger } from "@viacerta/ui";

import { Year1OutcomeForm } from "./Year1OutcomeForm";
import { Year3OutcomeForm } from "./Year3OutcomeForm";

export function OutcomeCaptureForm() {
  return (
    <Card>
      <CardBody>
        <Tabs defaultValue="year1">
          <TabsList>
            <TabsTrigger value="year1">Year 1</TabsTrigger>
            <TabsTrigger value="year3">Year 3</TabsTrigger>
          </TabsList>
          <TabsContent value="year1">
            <Year1OutcomeForm />
          </TabsContent>
          <TabsContent value="year3">
            <Year3OutcomeForm />
          </TabsContent>
        </Tabs>
      </CardBody>
    </Card>
  );
}
