import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./Table";

const meta: Meta<typeof Table> = {
  title: "Primitives/Table",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Cohort</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Asha Mehta</TableCell>
          <TableCell>September 2026</TableCell>
          <TableCell>
            <Badge variant="green">Ready</Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Rohan Gupta</TableCell>
          <TableCell>Unspecified</TableCell>
          <TableCell>
            <Badge variant="yellow">Ready with Plan</Badge>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
