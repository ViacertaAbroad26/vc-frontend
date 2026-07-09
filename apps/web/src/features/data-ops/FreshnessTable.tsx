import {
  AsyncBoundary,
  Badge,
  Card,
  CardBody,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@viacerta/ui";
import { formatDate } from "@viacerta/utils";

import { useFreshness } from "./useFreshness";

export function FreshnessTable() {
  const { data, isLoading, error } = useFreshness();

  return (
    <AsyncBoundary isLoading={isLoading} error={error} data={data}>
      {(freshness) => {
        const cells = freshness.cells ?? [];
        return (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Active matrix version: <span className="font-medium">{freshness.matrixVersion ?? "none"}</span>
            {" · "}
            Cells are considered stale after {freshness.maxStalenessDays} days.
          </p>

          <Card>
            <CardBody className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vertical</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Last refreshed</TableHead>
                    <TableHead>Age (days)</TableHead>
                    <TableHead>Data points</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cells.map((cell) => (
                    <TableRow key={`${cell.vertical}-${cell.country}`}>
                      <TableCell className="font-medium">{cell.vertical}</TableCell>
                      <TableCell>{cell.country}</TableCell>
                      <TableCell>{cell.lastRefreshAt ? formatDate(cell.lastRefreshAt) : "Never"}</TableCell>
                      <TableCell>{cell.ageDays ?? "—"}</TableCell>
                      <TableCell>{cell.dataPoints}</TableCell>
                      <TableCell>
                        <Badge variant={cell.stale ? "red" : "green"}>{cell.stale ? "Stale" : "Fresh"}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {cells.length === 0 && (
                <p className="py-12 text-center text-sm text-gray-500">No active matrix version.</p>
              )}
            </CardBody>
          </Card>
        </div>
        );
      }}
    </AsyncBoundary>
  );
}
