import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Primitives/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "Enter a value...",
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: "Asha Mehta" },
};

export const Error: Story = {
  args: { error: true, defaultValue: "invalid value" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Read only" },
};
