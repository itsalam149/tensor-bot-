"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { resetPasswordAction, type AuthState } from "@/actions/auth";

const initialState: AuthState = {
  error: null,
  success: null,
};

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState
  );

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a new secure password for your account."
    >
      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-slate-700">New password</label>
          <input
            name="password"
            type="password"
            placeholder="Enter new password"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#8a97ff] focus:ring-4 focus:ring-[#8a97ff]/10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-medium text-slate-700">Confirm password</label>
          <input
            name="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#8a97ff] focus:ring-4 focus:ring-[#8a97ff]/10"
          />
        </div>

        {state.error ? (
          <p className="text-sm text-red-500">{state.error}</p>
        ) : null}

        {state.success ? (
          <p className="text-sm text-emerald-600">{state.success}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-950 px-6 text-[14px] font-semibold text-white shadow-[0_18px_36px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-70"
        >
          {pending ? "Updating..." : "Update password"}
        </button>

        <p className="text-center text-[14px] text-slate-500">
          Back to{" "}
          <Link href="/sign-in" className="font-semibold text-slate-900 hover:underline">
            sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}