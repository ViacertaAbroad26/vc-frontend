import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "./Checkbox";
import { Label } from "./Label";

const meta: Meta<typeof Checkbox> = {
  title: "Primitives/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="parent-joined" />
      <Label htmlFor="parent-joined">Parent joined the session</Label>
    </div>
  ),
};
