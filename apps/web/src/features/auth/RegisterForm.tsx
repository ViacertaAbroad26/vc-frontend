import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Label } from "@viacerta/ui";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { useRegister } from "./useRegister";

const RegisterSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["STUDENT", "PARENT"]),
});

type RegisterValues = z.infer<typeof RegisterSchema>;

export function RegisterForm() {
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    mode: "onBlur",
    defaultValues: { role: "STUDENT" },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) => registerUser.mutate(values))}
    >
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" autoComplete="name" {...register("fullName")} />
        {errors.fullName && (
          <p className="text-sm text-flag-red-solid">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-sm text-flag-red-solid">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-flag-red-solid">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="role">I am a</Label>
        <select
          id="role"
          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900"
          {...register("role")}
        >
          <option value="STUDENT">Student</option>
          <option value="PARENT">Parent</option>
        </select>
      </div>

      {registerUser.isError && (
        <p className="text-sm text-flag-red-solid">
          Could not create your account. Please try again.
        </p>
      )}

      <Button type="submit" fullWidth loading={registerUser.isPending}>
        Create account
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-navy-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
