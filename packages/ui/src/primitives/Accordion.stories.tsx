import type { Meta, StoryObj } from "@storybook/react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./Accordion";

const meta: Meta<typeof Accordion> = {
  title: "Primitives/Accordion",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-96">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is the GCSS score?</AccordionTrigger>
        <AccordionContent>
          The Global Career & Study Suitability score summarizes a student&apos;s readiness across
          academic, financial, and cultural dimensions.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How is the risk band determined?</AccordionTrigger>
        <AccordionContent>
          The risk band is derived from the GCRI heatmap across the student&apos;s shortlisted
          countries.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
