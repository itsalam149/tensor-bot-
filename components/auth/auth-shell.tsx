import type { ReactNode } from "react";
import { AuthBrandPanel } from "./auth-brand-panel";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8faff] text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-18%] h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(129,151,255,0.24)_0%,rgba(129,151,255,0.10)_30%,rgba(255,255,255,0)_72%)] blur-3xl" />
        <div className="absolute right-[-10%] top-[8%] h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,rgba(156,172,255,0.16)_0%,rgba(156,172,255,0.08)_30%,rgba(255,255,255,0)_72%)] blur-3xl" />
        <div className="absolute bottom-[8%] left-[18%] h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(136,156,255,0.12)_0%,rgba(255,255,255,0)_72%)] blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-[1240px] items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
        <AuthBrandPanel />

        <section className="relative flex justify-center lg:justify-end">
          <div className="w-full max-w-[520px]">
            <div className="mb-5 lg:hidden">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-[12px] font-medium text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.04)] backdrop-blur-xl">
                Tensor-Bot
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200/80 bg-white/84 p-6 shadow-[0_18px_64px_rgba(15,23,42,0.055)] backdrop-blur-2xl sm:p-8">
              <div className="mb-8">
                <h1 className="text-[34px] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[40px]">
                  {title}
                </h1>
                <p className="mt-3 max-w-[420px] text-[15px] leading-7 text-slate-500">
                  {subtitle}
                </p>
              </div>

              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}