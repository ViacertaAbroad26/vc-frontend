import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Primitives/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: {
    children: "Badge",
    variant: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "navy", "amber", "green", "yellow", "red"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="navy">Navy</Badge>
      <Badge variant="amber">Amber</Badge>
      <Badge variant="green">Ready</Badge>
      <Badge variant="yellow">Ready with Plan</Badge>
      <Badge variant="red">Not Yet Ready</Badge>
    </div>
  ),
};
