import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";

export function HeroContent() {
  return (
    <div className="relative pt-2">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/80 px-3.5 py-1.5 text-[12px] font-medium text-slate-700 shadow-[0_4px_16px_rgba(15,23,42,0.04)] backdrop-blur-xl">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <Sparkles className="h-2.5 w-2.5" />
        </span>
        AI Chatbot Infrastructure for Business
      </div>

      <h1 className="max-w-[620px] text-[52px] font-semibold leading-[0.98] tracking-[-0.05em] text-slate-950 sm:text-[64px] lg:text-[70px]">
        Turn business knowledge into a{" "}
        <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
          smart assistant.
        </span>
      </h1>

      <p className="mt-6 max-w-[520px] text-[16px] leading-7 text-slate-600">
        Tensor-Bot crawls your website and documents to answer customer questions, suggest products, and automate support.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href="/sign-up"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-slate-950 px-6 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98]"
        >
          Get started
          <ArrowRight className="h-4 w-4" />
        </Link>

        <Link
          href="#how-it-works"
          className="inline-flex h-12 items-center gap-2.5 rounded-full border border-slate-200/90 bg-white px-5 text-[14px] font-semibold text-slate-800 shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
        >
          <span>See how it works</span>
          <ArrowUpRight className="h-4 w-4 text-slate-500" />
        </Link>
      </div>
    </div>
  );
}