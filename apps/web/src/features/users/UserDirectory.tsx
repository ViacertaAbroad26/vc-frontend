import { ApiError, type UserRole } from "@viacerta/api-client";
import {
  AsyncBoundary,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@viacerta/ui";
import { ROLE_CATEGORY_ORDER, roleCategory, roleLabel } from "@viacerta/utils";

import { useOrganizations } from "@/features/organizations/useOrganizations";
import { useAuthStore } from "@/stores/auth-store";

import { CreateUserForm } from "./CreateUserForm";
import { assignableRoles } from "./roles";
import { useChangeUserRole } from "./useChangeUserRole";
import { useUsers } from "./useUsers";

export function UserDirectory() {
  const { data, isLoading, error } = useUsers();
  const changeRole = useChangeUserRole();
  const actingRole = useAuthStore((s) => s.user?.role);
  const roleOptions = assignableRoles(actingRole);

  const { data: orgsData } = useOrganizations();
  const branches = orgsData?.data ?? [];
  const branchName = (orgId: string | null | undefined) =>
    branches.find((b) => b.id === orgId)?.name ?? "Unassigned / HQ";

  return (
    <div className="space-y-6">
      <CreateUserForm />

      <AsyncBoundary isLoading={isLoading} error={error} data={data}>
        {(result) => {
          if (result.data.length === 0) {
            return (
              <Card>
                <CardBody>
                  <p className="py-12 text-center text-sm text-gray-500">No users yet.</p>
                </CardBody>
              </Card>
            );
          }

          const groups = ROLE_CATEGORY_ORDER.map((category) => ({
            category,
            users: result.data.filter((u) => roleCategory(u.role) === category),
          })).filter((g) => g.users.length > 0);

          return (
            <div className="space-y-6">
              {groups.map((group) => (
                <Card key={group.category}>
                  <CardHeader>
                    <h2 className="text-sm font-medium text-gray-900">
                      {group.category} <span className="text-gray-400">({group.users.length})</span>
                    </h2>
                  </CardHeader>
                  <CardBody className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Branch</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.users.map((u) => {
                          const options: readonly UserRole[] = roleOptions.includes(u.role)
                            ? roleOptions
                            : [u.role, ...roleOptions];

                          return (
                            <TableRow key={u.id}>
                              <TableCell className="font-medium text-gray-900">{u.fullName}</TableCell>
                              <TableCell className="text-gray-600">{u.email}</TableCell>
                              <TableCell className="text-gray-600">{branchName(u.orgId)}</TableCell>
                              <TableCell>
                                <select
                                  aria-label={`Change role for ${u.fullName}`}
                                  value={u.role}
                                  disabled={changeRole.isPending && changeRole.variables?.userId === u.id}
                                  onChange={(e) =>
                                    changeRole.mutate({ userId: u.id, role: e.target.value as UserRole })
                                  }
                                  className="h-9 w-44 rounded-md border border-gray-300 bg-white px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
                                >
                                  {options.map((role) => (
                                    <option key={role} value={role}>
                                      {roleLabel(role)}
                                    </option>
                                  ))}
                                </select>
                                {changeRole.isError && changeRole.variables?.userId === u.id && (
                                  <p className="mt-1 text-xs text-flag-red-solid">
                                    {changeRole.error instanceof ApiError && changeRole.error.status === 403
                                      ? "You don't have permission to assign this role."
                                      : "Could not change this user's role."}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell>
                                {u.isActive ? (
                                  <Badge variant="green">Active</Badge>
                                ) : (
                                  <Badge variant="default">Inactive</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardBody>
                </Card>
              ))}
            </div>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
