import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";

export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="Verify your email"
      subtitle="Check your inbox and click the verification link to continue."
    >
      <div className="space-y-5">
        <div className="rounded-[22px] border border-slate-200/80 bg-[#fbfcff] p-5 text-[14px] leading-7 text-slate-600">
          We have sent a verification link to your email address. Once verified, you can continue to your account.
        </div>

        <button
          type="button"
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-950 px-6 text-[14px] font-semibold text-white shadow-[0_18px_36px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Resend email
        </button>

        <p className="text-center text-[14px] text-slate-500">
          Already verified?{" "}
          <Link href="/signin" className="font-semibold text-slate-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}