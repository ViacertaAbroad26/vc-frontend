import {
  AsyncBoundary,
  Card,
  CardBody,
  CardHeader,
  GcssFlagBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@viacerta/ui";
import { roleLabel, routes } from "@viacerta/utils";
import { Link } from "react-router-dom";

import { useAdminOverview } from "./useAdminOverview";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardBody>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="mt-1 text-3xl font-semibold text-gray-900">{value}</div>
      </CardBody>
    </Card>
  );
}

export function AdminOverview() {
  const { data, isLoading, error } = useAdminOverview();

  return (
    <AsyncBoundary isLoading={isLoading} error={error} data={data}>
      {(overview) => {
        const flagRows = [
          { flag: "GREEN" as const, label: "Green · Ready", count: overview.gcssFlagCounts.green ?? 0 },
          { flag: "YELLOW" as const, label: "Yellow · Ready with plan", count: overview.gcssFlagCounts.yellow ?? 0 },
          { flag: "RED" as const, label: "Red · Not yet ready", count: overview.gcssFlagCounts.red ?? 0 },
          { flag: "DECLINED" as const, label: "Declined", count: overview.gcssFlagCounts.declined ?? 0 },
        ];
        const noneCount = overview.gcssFlagCounts.none ?? 0;
        const flagTotal = flagRows.reduce((sum, r) => sum + r.count, 0) + noneCount;
        const pct = (n: number) => (flagTotal === 0 ? "0%" : `${Math.round((n / flagTotal) * 100)}%`);

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard label="Branches" value={overview.totalBranches} />
              <StatCard label="Total students" value={overview.totalStudents} />
              <StatCard label="Total staff" value={overview.totalStaff} />
            </div>

            <Card>
              <CardHeader>
                <h2 className="text-sm font-medium text-gray-900">GCSS flag breakdown</h2>
              </CardHeader>
              <CardBody className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Flag</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Share</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flagRows.map((r) => (
                      <TableRow key={r.flag}>
                        <TableCell>
                          <GcssFlagBadge flag={r.flag} />
                        </TableCell>
                        <TableCell>{r.count}</TableCell>
                        <TableCell>{pct(r.count)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="text-gray-500">Not yet assessed</TableCell>
                      <TableCell>{noneCount}</TableCell>
                      <TableCell>{pct(noneCount)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-900">Staff by role</h2>
                <Link to={routes.users} className="text-sm text-navy-600 hover:underline">
                  Manage users
                </Link>
              </CardHeader>
              <CardBody className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.staffByRole.map((r) => (
                      <TableRow key={r.role}>
                        <TableCell className="font-medium text-gray-900">{roleLabel(r.role)}</TableCell>
                        <TableCell>{r.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {overview.staffByRole.length === 0 && (
                  <p className="py-12 text-center text-sm text-gray-500">No staff yet.</p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-900">Branches</h2>
                <Link to={routes.organizations} className="text-sm text-navy-600 hover:underline">
                  Manage branches
                </Link>
              </CardHeader>
              <CardBody className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.branches.map((branch) => (
                      <TableRow key={branch.orgId ?? "unassigned"}>
                        <TableCell className="font-medium text-gray-900">{branch.name}</TableCell>
                        <TableCell>{branch.code}</TableCell>
                        <TableCell>{branch.studentCount}</TableCell>
                        <TableCell>{branch.staffCount}</TableCell>
                        <TableCell className="text-right">
                          <Link
                            to={branch.orgId ? `${routes.cases}?org=${branch.orgId}` : routes.cases}
                            className="text-navy-600 hover:underline"
                          >
                            View students
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {overview.branches.length === 0 && (
                  <p className="py-12 text-center text-sm text-gray-500">No branches yet.</p>
                )}
              </CardBody>
            </Card>

            <div className="flex flex-wrap gap-4 text-sm">
              <Link to={routes.cases} className="text-navy-600 hover:underline">
                All students
              </Link>
              <Link to={routes.users} className="text-navy-600 hover:underline">
                Staff &amp; users
              </Link>
              <Link to={routes.organizations} className="text-navy-600 hover:underline">
                Branches
              </Link>
            </div>
          </div>
        );
      }}
    </AsyncBoundary>
  );
}
