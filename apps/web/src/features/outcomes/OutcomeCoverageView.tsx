import {
  AsyncBoundary,
  Card,
  CardBody,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@viacerta/ui";

import { useOutcomeCoverage } from "./useOutcomeCoverage";

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function OutcomeCoverageView() {
  const { data, isLoading, error } = useOutcomeCoverage();

  return (
    <AsyncBoundary isLoading={isLoading} error={error} data={data}>
      {(coverage) => (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {coverage.totalConfirmed} confirmed assessments · {coverage.totalYear1Captured} Year-1 outcomes captured
            ({pct(coverage.totalYear1CoveragePct)} overall coverage)
          </p>

          <Card>
            <CardBody className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cohort</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Confirmed</TableHead>
                    <TableHead>Year-1 captured</TableHead>
                    <TableHead>Year-1 coverage</TableHead>
                    <TableHead>Year-3 captured</TableHead>
                    <TableHead>Year-3 coverage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coverage.cohorts.map((row) => (
                    <TableRow key={row.cohort}>
                      <TableCell className="font-medium">{row.cohort}</TableCell>
                      <TableCell>{row.studentCount}</TableCell>
                      <TableCell>{row.confirmedCount}</TableCell>
                      <TableCell>{row.year1CapturedCount}</TableCell>
                      <TableCell>{pct(row.year1CoveragePct)}</TableCell>
                      <TableCell>{row.year3CapturedCount}</TableCell>
                      <TableCell>{pct(row.year3CoveragePct)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {coverage.cohorts.length === 0 && (
                <p className="py-12 text-center text-sm text-gray-500">No cohort data yet.</p>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </AsyncBoundary>
  );
}
