import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "./Label";
import { RadioGroup, RadioGroupItem } from "./RadioGroup";

const meta: Meta<typeof RadioGroup> = {
  title: "Primitives/RadioGroup",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="promoted" className="space-y-2">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="promoted" id="promoted" />
        <Label htmlFor="promoted">Promoted</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="same" id="same" />
        <Label htmlFor="same">Same role</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="changed-field" id="changed-field" />
        <Label htmlFor="changed-field">Changed field</Label>
      </div>
    </RadioGroup>
  ),
};
