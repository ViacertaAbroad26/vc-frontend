import type { Meta, StoryObj } from "@storybook/react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";

const meta: Meta<typeof Select> = {
  title: "Primitives/Select",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select defaultValue="usd">
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select a currency" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="inr">INR</SelectItem>
        <SelectItem value="eur">EUR</SelectItem>
        <SelectItem value="usd">USD</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Placeholder: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ca">Canada</SelectItem>
        <SelectItem value="de">Germany</SelectItem>
        <SelectItem value="ie">Ireland</SelectItem>
      </SelectContent>
    </Select>
  ),
};
