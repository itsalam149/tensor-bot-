import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";

export function CTASection() {
  return (
    <section className="relative z-10 py-16 lg:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-[36px] border border-slate-900/90 bg-slate-950 px-8 py-16 text-center text-white shadow-[0_24px_60px_rgba(15,23,42,0.30)] sm:px-12 lg:px-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium text-indigo-200 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Deploy in under 5 minutes
            </div>

            <h2 className="text-[36px] font-semibold tracking-[-0.05em] text-white sm:text-[46px]">
              Ready to launch your custom AI assistant?
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-7 text-slate-300">
              Join forward-thinking businesses using Tensor-Bot to answer customer questions and increase conversion.
            </p>

            <div className="mt-8 flex justify-center">
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[14px] font-bold text-slate-950 shadow-[0_12px_30px_rgba(255,255,255,0.25)] transition hover:-translate-y-0.5 hover:bg-slate-100 active:scale-[0.98]"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}