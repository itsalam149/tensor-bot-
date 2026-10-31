import Link from "next/link";
import { BadgeCheck, CircleDashed, Globe, MessageSquare, Sparkles } from "lucide-react";

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden lg:block">
      <div className="relative max-w-[540px]">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/78 px-4 py-2 text-[12px] font-medium text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.04)] backdrop-blur-xl">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#eef2ff] text-[#7d8cff]">
            <Globe className="h-3 w-3" />
          </div>
          AI Chatbot Infrastructure for Business
        </div>

        <h2 className="text-[60px] font-semibold leading-[0.95] tracking-[-0.06em] text-slate-950 xl:text-[72px]">
          Build the
          <br />
          next assistant
          <br />
          <span className="bg-gradient-to-r from-[#5875ff] via-[#7d8eff] to-[#8d94ff] bg-clip-text text-transparent">
            for your brand.
          </span>
        </h2>

        <p className="mt-7 max-w-[520px] text-[15.5px] leading-8 text-slate-500">
          Create a polished auth experience that feels native to the same clean product UI.
        </p>

        <div className="mt-8 flex flex-wrap gap-7 text-[13px] text-slate-500">
          {["No credit card", "Setup in minutes", "Cancel anytime"].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eef2ff] text-[#7b8eff]">
                <BadgeCheck className="h-4 w-4" />
              </span>
              {item}
            </div>
          ))}
        </div>

        <div className="mt-10 grid max-w-[460px] grid-cols-2 gap-4">
          {[
            ["Fast onboarding", "For users and teams"],
            ["Secure access", "Email, password, OAuth"],
            ["Brand aligned", "Same glassmorphism look"],
            ["Reusable system", "One shell for every page"],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-[22px] border border-slate-200/80 bg-white/75 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl">
              <div className="text-[14px] font-semibold text-slate-900">{title}</div>
              <div className="mt-1 text-[13px] leading-6 text-slate-500">{desc}</div>
            </div>
          ))}
        </div>

        <div className="absolute right-[-18px] top-[18%] flex h-13 w-13 items-center justify-center rounded-[18px] border border-white/80 bg-white/88 shadow-[0_10px_32px_rgba(125,145,255,0.18)] backdrop-blur-xl">
          <CircleDashed className="h-5 w-5 text-[#8a97ff]" />
        </div>
        <div className="absolute right-[5%] bottom-[8%] flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/80 bg-white/88 shadow-[0_10px_32px_rgba(125,145,255,0.18)] backdrop-blur-xl">
          <MessageSquare className="h-5 w-5 text-[#8a97ff]" />
        </div>
        <div className="absolute left-[2%] bottom-[18%] flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/80 bg-white/88 shadow-[0_10px_32px_rgba(125,145,255,0.18)] backdrop-blur-xl">
          <Sparkles className="h-5 w-5 text-[#8a97ff]" />
        </div>

        <div className="mt-10 text-[13px] text-slate-500">
          Go back to{" "}
          <Link href="/" className="font-medium text-slate-900 underline-offset-4 hover:underline">
            homepage
          </Link>
        </div>
      </div>
    </aside>
  );
}