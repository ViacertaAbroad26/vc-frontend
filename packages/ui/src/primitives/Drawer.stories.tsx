import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./Button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "./Drawer";

const meta: Meta<typeof Drawer> = {
  title: "Primitives/Drawer",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => (
    <Drawer defaultOpen>
      <DrawerTrigger asChild>
        <Button>Open audit log</Button>
      </DrawerTrigger>
      <DrawerContent side="right">
        <DrawerHeader>
          <DrawerTitle>Audit log</DrawerTitle>
          <DrawerDescription>Document verification history for this student.</DrawerDescription>
        </DrawerHeader>
        <p className="text-sm text-gray-600">
          Document verified against original passport scan on 2026-06-10.
        </p>
      </DrawerContent>
    </Drawer>
  ),
};

export const LeftSide: Story = {
  render: () => (
    <Drawer defaultOpen>
      <DrawerTrigger asChild>
        <Button>Open filters</Button>
      </DrawerTrigger>
      <DrawerContent side="left">
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerHeader>
        <p className="text-sm text-gray-600">Filter the case queue by cohort and risk band.</p>
      </DrawerContent>
    </Drawer>
  ),
};
