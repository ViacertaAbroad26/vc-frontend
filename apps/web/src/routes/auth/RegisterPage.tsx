import { Logo } from "@viacerta/ui";

import { RegisterForm } from "@/features/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen bg-linen-50">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-navy-700 p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-mint-400/30"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-navy-500/40"
          aria-hidden="true"
        />
        <Logo inverted className="z-10" />
        <div className="z-10 max-w-md space-y-4">
          <h2 className="font-heading text-4xl font-bold leading-tight">
            Start your journey <span className="text-mint-400">the certain way.</span>
          </h2>
          <p className="text-lg text-linen-100">
            Tell us a bit about yourself and we&apos;ll match you with the right advisor and
            study-abroad plan.
          </p>
        </div>
        <p className="z-10 text-sm text-linen-200">© {new Date().getFullYear()} ViaCerta</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-8 lg:w-1/2">
        <div className="w-full max-w-sm space-y-6 rounded-2xl border border-navy-100 bg-white p-8 shadow-md">
          <div className="space-y-1 text-center">
            <div className="mb-2 flex justify-center lg:hidden">
              <Logo />
            </div>
            <h1 className="font-heading text-2xl font-bold text-navy-900">Create your account</h1>
            <p className="text-sm text-gray-600">Join ViaCerta and get started today</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
