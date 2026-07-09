import { AsyncBoundary, Badge, Card, CardBody } from "@viacerta/ui";

import { CreateOrganizationForm } from "./CreateOrganizationForm";
import { useOrganizations } from "./useOrganizations";

export function OrganizationsView() {
  const { data, isLoading, error } = useOrganizations();

  return (
    <div className="space-y-6">
      <CreateOrganizationForm />

      <AsyncBoundary isLoading={isLoading} error={error} data={data}>
        {(result) => (
          <Card>
            <CardBody className="p-0">
              <ul className="divide-y divide-gray-100">
                {result.data.map((org) => (
                  <li key={org.id} className="flex flex-wrap items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900">{org.name}</div>
                      <div className="mt-0.5 text-xs text-gray-500">
                        {org.code}
                        {org.city ? ` · ${org.city}` : ""}
                      </div>
                    </div>
                    {!org.isActive && <Badge variant="default">Inactive</Badge>}
                  </li>
                ))}
              </ul>

              {result.data.length === 0 && (
                <p className="py-12 text-center text-sm text-gray-500">No branches yet.</p>
              )}
            </CardBody>
          </Card>
        )}
      </AsyncBoundary>
    </div>
  );
}
