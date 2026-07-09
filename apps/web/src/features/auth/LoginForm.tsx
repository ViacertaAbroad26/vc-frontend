import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Divider, Input, Label } from "@viacerta/ui";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { GoogleIcon } from "./GoogleIcon";
import { NAVY, NAVY_LIGHT, TEAL } from "./brand";
import { useLogin } from "./useLogin";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof LoginSchema>;

const FIELD_CLASSES =
  "h-auto rounded-[10px] border-2 border-gray-200 px-3.5 py-2.5 focus-visible:border-[#2BAE76] focus-visible:ring-2 focus-visible:ring-[#2BAE76]/20";

export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(LoginSchema), mode: "onBlur" });

  return (
    <form className="space-y-5" onSubmit={handleSubmit((values) => login.mutate(values))}>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className={FIELD_CLASSES}
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-flag-red-solid">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          className={FIELD_CLASSES}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-flag-red-solid">{errors.password.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Link to="/forgot-password" className="text-sm font-medium" style={{ color: TEAL }}>
          Forgot password?
        </Link>
      </div>

      {login.isError && (
        <p className="text-sm text-flag-red-solid">
          Could not sign in. Check your credentials and try again.
        </p>
      )}

      <Button
        type="submit"
        fullWidth
        loading={login.isPending}
        className="relative h-auto overflow-hidden rounded-[10px] py-3 text-[15px] shadow-none transition-transform hover:scale-[1.01] hover:shadow-lg active:scale-[0.98]"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)` }}
      >
        {!login.isPending && (
          <span
            className="animate-shimmer pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
            }}
            aria-hidden="true"
          />
        )}
        Sign in
      </Button>

      <div className="relative">
        <Divider />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs uppercase tracking-wide text-gray-400">
          or
        </span>
      </div>

      <Button
        type="button"
        variant="secondary"
        fullWidth
        className="h-auto gap-3 rounded-[10px] border-[1.5px] border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-shadow hover:border-[#2BAE76] hover:shadow-[0_2px_12px_rgba(43,174,118,0.13)]"
      >
        <GoogleIcon className="h-[18px] w-[18px]" />
        Continue with Google
      </Button>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold" style={{ color: TEAL }}>
          Create one
        </Link>
      </p>
    </form>
  );
}
