import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@viacerta/api-client";
import { Button, Card, CardBody, Input, Label } from "@viacerta/ui";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuthStore } from "@/stores/auth-store";

import { assignableRoles, USER_ROLES } from "./roles";
import { useCreateUser } from "./useCreateUser";

const Schema = z.object({
  fullName: z.string().min(2, "Enter a full name"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(USER_ROLES),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof Schema>;

export function CreateUserForm() {
  const createUser = useCreateUser();
  const actingRole = useAuthStore((s) => s.user?.role);
  const roleOptions = assignableRoles(actingRole);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(Schema), defaultValues: { role: "ADVISOR" } });

  const onSubmit = handleSubmit(async (values) => {
    await createUser.mutateAsync({
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      role: values.role,
      phone: values.phone || null,
    });
    reset();
  });

  return (
    <Card>
      <CardBody>
        <h2 className="font-semibold text-gray-900">Add a user</h2>
        <form onSubmit={onSubmit} className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" {...register("fullName")} />
            {errors.fullName && <p className="text-xs text-flag-red-solid">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-flag-red-solid">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Temporary password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-xs text-flag-red-solid">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
              {...register("role")}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" {...register("phone")} />
          </div>

          {createUser.isError && (
            <p className="text-sm text-flag-red-solid sm:col-span-2">
              {createUser.error instanceof ApiError && createUser.error.status === 403
                ? "You don't have permission to assign this role."
                : "Could not create the user. The email may already be registered."}
            </p>
          )}

          <div className="sm:col-span-2">
            <Button type="submit" loading={createUser.isPending}>
              Add user
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
