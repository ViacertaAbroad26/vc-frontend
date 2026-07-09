import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./Input";
import { Label } from "./Label";

const meta: Meta<typeof Label> = {
  title: "Primitives/Label",
  component: Label,
  tags: ["autodocs"],
  args: {
    children: "Student ID",
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {};

export const WithInput: Story = {
  render: () => (
    <div className="space-y-1">
      <Label htmlFor="student-id">Student ID</Label>
      <Input id="student-id" placeholder="stu_123" />
    </div>
  ),
};
