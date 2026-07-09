import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./Button";
import { Card, CardBody, CardFooter, CardHeader } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Primitives/Card",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-96">
      <CardBody>
        <p className="text-sm text-gray-600">A simple card with body content only.</p>
      </CardBody>
    </Card>
  ),
};

export const WithHeaderAndFooter: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Asha Mehta</h3>
        <p className="text-sm text-gray-500">Cohort: September 2026</p>
      </CardHeader>
      <CardBody>
        <p className="text-sm text-gray-600">
          GCSS score 78, flag: Ready with Plan. Year-1 outcome not yet captured.
        </p>
      </CardBody>
      <CardFooter>
        <Button size="sm" variant="secondary">
          View details
        </Button>
      </CardFooter>
    </Card>
  ),
};
