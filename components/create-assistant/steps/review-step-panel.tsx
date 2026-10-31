"use client";

import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { useWizard } from "@/lib/wizard/wizard-context";
import { DeploymentPreview } from "@/components/create-assistant/shared/deployment-preview";
import { IntegrationCard } from "@/components/create-assistant/shared/integration-card";

export function ReviewStepPanel() {
  const { state } = useWizard();

  if (!state.botId) {
    return (
      <section className="rounded-[30px] border border-slate-900/5 bg-white/80 p-8 text-center text-slate-500 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
        <div className="text-base font-medium text-slate-900">No Assistant Created Yet</div>
        <p className="mt-1 text-xs text-slate-500">Please enter your website URL in Step 1 to initialize your assistant.</p>
      </section>
    );
  }

  const completedSources = state.sources.filter((s) => s.status === "completed");
  const failedSources = state.sources.filter((s) => s.status === "failed");

  return (
    <section className="rounded-[30px] border border-slate-900/5 bg-white/80 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-600">
          <Sparkles className="h-3.5 w-3.5" /> Step 5 of 5
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Review &amp; Deploy</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Review your assistant&apos;s memory configuration. Click <span className="font-semibold text-slate-900">Deploy Assistant</span> below to publish and generate your embed code.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-950">Assistant Summary</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <SummaryStat label="Website" value={state.websiteUrl ? "Connected" : "Not set"} />
              <SummaryStat label="Sources Ready" value={String(completedSources.length)} />
              <SummaryStat label="Live Data" value={state.liveData.enabled ? "Active" : "Disabled"} />
            </div>

            {state.finalizeError && (
              <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                {state.finalizeError}
              </div>
            )}

            {failedSources.length > 0 && (
              <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                {failedSources.length} source{failedSources.length === 1 ? "" : "s"} encountered issues during ingestion.
              </div>
            )}
          </div>

          {state.embed ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-xs font-medium text-emerald-800 shadow-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                Assistant is published! Copy either code snippet below into your site.
              </div>

              <IntegrationCard
                title="HTML CDN Script Tag"
                description="Include in your site's <head> element."
                language="html"
                code={state.embed.scriptSnippet}
              />

              <IntegrationCard
                title="React / Next.js Component"
                description="Use directly in modern React applications."
                language="tsx"
                code={state.embed.reactSnippet}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 text-xs text-slate-500 shadow-sm flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>
                Click <span className="font-semibold text-slate-900">Deploy Assistant</span> in the bottom bar to generate live widget embed snippets.
              </span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-950 mb-3">Live Interactive Preview</div>
          <DeploymentPreview brand={state.brand} botName={state.botName} />
        </div>
      </div>
    </section>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 px-3.5 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 text-base font-bold text-slate-950 truncate">{value}</div>
    </div>
  );
}

