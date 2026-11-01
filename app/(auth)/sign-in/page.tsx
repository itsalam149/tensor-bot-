"use client";

import Link from "next/link";
import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { signInAction, type AuthState } from "@/actions/auth";

const initialState: AuthState = {
  error: null,
  success: null,
};

function SignInForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const displayError = state.error || urlError;

  return (
    <div className="space-y-6">
      <GoogleButton label="Sign in with Google" nextUrl="/dashboard" />

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-slate-200" />
        <span className="absolute bg-[#f9fafb] px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          or continue with email
        </span>
      </div>

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-slate-700">Email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="name@company.com"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#8a97ff] focus:ring-4 focus:ring-[#8a97ff]/10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-medium text-slate-700">Password</label>
          <input
            name="password"
            type="password"
            required
            placeholder="Enter your password"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#8a97ff] focus:ring-4 focus:ring-[#8a97ff]/10"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-[13px] text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-[#7d8eff] focus:ring-[#8a97ff]"
            />
            Remember me
          </label>

          <Link href="/forgot-password" className="text-[13px] font-medium text-[#6478ff] hover:underline">
            Forgot password?
          </Link>
        </div>

        {displayError ? (
          <div className="rounded-2xl border border-red-200/80 bg-red-50/80 p-3.5 text-center text-xs font-medium text-red-600 backdrop-blur-md">
            {displayError}
          </div>
        ) : null}

        {state.success ? (
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-3.5 text-center text-xs font-medium text-emerald-600 backdrop-blur-md">
            {state.success}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-950 px-6 text-[14px] font-semibold text-white shadow-[0_18px_36px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-70"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-center text-[14px] text-slate-500">
          New here?{" "}
          <Link href="/sign-up" className="font-semibold text-slate-900 hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your Tensor-Bot dashboard and manage your assistant."
    >
      <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-400 text-sm">Loading sign in...</div>}>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}