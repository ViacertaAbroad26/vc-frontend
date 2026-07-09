import type { Meta, StoryObj } from "@storybook/react";

import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "Primitives/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: {
    placeholder: "Add notes...",
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: "Covered intake summary and target countries." },
};

export const Error: Story = {
  args: { error: true, defaultValue: "invalid value" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Read only" },
};
