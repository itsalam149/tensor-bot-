import { ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export function HeroChatPreview() {
  return (
    <div className="relative flex justify-center lg:justify-end">
      <div className="relative w-full max-w-[490px]">
        <div className="absolute inset-0 rounded-[42px] bg-[radial-gradient(circle_at_50%_38%,rgba(126,145,255,0.22)_0%,rgba(126,145,255,0.11)_20%,rgba(255,255,255,0)_64%)] blur-3xl" />

        <GlassCard className="relative overflow-hidden px-6 py-6 sm:px-7 sm:py-7">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-[11px] font-semibold text-white shadow-sm">
                T
              </div>
              <div>
                <div className="text-[13px] font-semibold text-slate-900">Hi, I&apos;m your assistant</div>
                <div className="text-[11px] text-slate-500">How can I help you today?</div>
              </div>
            </div>
            <div className="rounded-full px-2 py-1 text-slate-400 text-[16px] leading-none tracking-widest">···</div>
          </div>

          {/* User message */}
          <div className="mt-9 flex justify-end">
            <div className="max-w-[78%] rounded-[16px] bg-slate-100 px-4 py-3 text-[13px] font-medium text-slate-700 shadow-sm">
              Do you have the black hoodie in medium?
            </div>
          </div>

          {/* Bot reply */}
          <div className="mt-5 flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[12px] font-semibold text-white shadow-sm">
              T
            </div>
            <div className="max-w-[84%] rounded-[16px] bg-white px-4 py-3 text-[13px] leading-6 text-slate-700 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
              Yes! The Black Oversized Hoodie is in stock in Medium.
              <br />
              Would you like me to show similar options under ₹2000?
            </div>
          </div>

          {/* Animated typing indicator */}
          <div className="mt-5 flex items-center gap-2.5 pl-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-[12px] font-semibold text-white shadow-sm">
              T
            </div>
            <div className="flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 shadow-sm">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>

          {/* Input bar */}
          <div className="mt-8 flex h-14 items-center justify-between rounded-[16px] border border-slate-200 bg-white px-4 text-[13px] text-slate-400 shadow-[0_8px_24px_rgba(15,23,42,0.045)]">
            <span>Ask anything about our products...</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7b89ff] to-[#95a3ff] text-white shadow-[0_10px_20px_rgba(123,137,255,0.28)]">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}