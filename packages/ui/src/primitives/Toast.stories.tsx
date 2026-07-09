import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./Button";
import { Toaster } from "./Toaster";
import { toast } from "./use-toast";

const meta: Meta = {
  title: "Primitives/Toast",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Button onClick={() => toast.success("Year-1 outcome captured.")}>Show success toast</Button>
      <Button variant="secondary" onClick={() => toast.warning("This dispute is awaiting a response.")}>
        Show warning toast
      </Button>
      <Button variant="destructive" onClick={() => toast.error("Could not capture this row.")}>
        Show error toast
      </Button>
      <Toaster />
    </div>
  ),
};
