import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, CardBody, Input, Label } from "@viacerta/ui";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCreateOrganization } from "./useCreateOrganization";

const Schema = z.object({
  name: z.string().min(2, "Enter a branch name"),
  code: z.string().min(2, "Enter a short branch code"),
  city: z.string().optional(),
});

type FormValues = z.infer<typeof Schema>;

export function CreateOrganizationForm() {
  const createOrganization = useCreateOrganization();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(Schema) });

  const onSubmit = handleSubmit(async (values) => {
    await createOrganization.mutateAsync({
      name: values.name,
      code: values.code,
      city: values.city || null,
    });
    reset();
  });

  return (
    <Card>
      <CardBody>
        <h2 className="font-semibold text-gray-900">Add a branch</h2>
        <form onSubmit={onSubmit} className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="org-name">Name</Label>
            <Input id="org-name" {...register("name")} />
            {errors.name && <p className="text-xs text-flag-red-solid">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="org-code">Code</Label>
            <Input id="org-code" {...register("code")} />
            {errors.code && <p className="text-xs text-flag-red-solid">{errors.code.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="org-city">City (optional)</Label>
            <Input id="org-city" {...register("city")} />
          </div>

          {createOrganization.isError && (
            <p className="text-sm text-flag-red-solid sm:col-span-3">
              Could not create the branch. The code may already be in use.
            </p>
          )}

          <div className="sm:col-span-3">
            <Button type="submit" loading={createOrganization.isPending}>
              Add branch
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
