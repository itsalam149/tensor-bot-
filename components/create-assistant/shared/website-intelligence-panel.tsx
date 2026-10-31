"use client";

import { Sparkles, Globe, ShieldCheck } from "lucide-react";
import { useWizard } from "@/lib/wizard/wizard-context";

function DetailRow({
  label,
  value,
  swatch,
}: {
  label: string;
  value: string;
  swatch?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2.5 last:border-0">
      <div className="text-xs text-slate-500 font-medium">{label}</div>
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
        {swatch ? <span className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: swatch }} /> : null}
        {value}
      </div>
    </div>
  );
}

export function WebsiteIntelligencePanel() {
  const { state } = useWizard();

  let hostname = "Not connected";
  if (state.websiteUrl) {
    try {
      hostname = new URL(state.websiteUrl).hostname;
    } catch {
      hostname = state.websiteUrl;
    }
  }

  return (
    <section className="rounded-[30px] border border-slate-900/5 bg-white/80 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-950">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <h3 className="text-base font-semibold">Website Intelligence</h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">Live detection from connected domain</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Globe className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-900 truncate">{hostname}</div>
            <p className="text-[11px] text-slate-500">
              {state.websiteStatus === "success"
                ? `Crawl active (${state.websiteSummary?.pageCount ?? 1} pages)`
                : "Awaiting domain URL"}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <DetailRow label="Primary Color" value={state.brand.primaryColor} swatch={state.brand.primaryColor} />
          <DetailRow label="Accent Color" value={state.brand.accentColor} swatch={state.brand.accentColor} />
          <DetailRow label="Font" value={state.brand.font} />
          <DetailRow label="Tone" value={state.brand.tone} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-slate-50 px-3.5 py-3 text-xs text-slate-600">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
        <span>RAG knowledge vector memory active.</span>
      </div>
    </section>
  );
}