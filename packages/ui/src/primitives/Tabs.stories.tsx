import type { Meta, StoryObj } from "@storybook/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Primitives/Tabs",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="coverage" className="w-96">
      <TabsList>
        <TabsTrigger value="coverage">Coverage</TabsTrigger>
        <TabsTrigger value="capture">Capture outcome</TabsTrigger>
        <TabsTrigger value="bulk-import">Bulk import</TabsTrigger>
      </TabsList>
      <TabsContent value="coverage">Outcome data coverage per cohort.</TabsContent>
      <TabsContent value="capture">Capture a Year-1 or Year-3 outcome for a student.</TabsContent>
      <TabsContent value="bulk-import">Paste CSV data to import outcomes in bulk.</TabsContent>
    </Tabs>
  ),
};
