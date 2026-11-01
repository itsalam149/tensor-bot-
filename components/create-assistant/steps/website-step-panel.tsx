"use client";

import { useState, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Globe,
  ArrowRight,
  Loader2,
  Sparkles,
  AlertCircle,
  FileCheck,
  Layers,
} from "lucide-react";
import { useWizard } from "@/lib/wizard/wizard-context";

export function WebsiteStepPanel({
  onAnalyzed,
  onNext,
}: {
  onAnalyzed?: () => void;
  onNext?: () => void;
}) {
  const { state, analyzeWebsite, goNext } = useWizard();
  const [inputUrl, setInputUrl] = useState(state.websiteUrl);

  useEffect(() => {
    if (state.websiteUrl && !inputUrl) {
      setInputUrl(state.websiteUrl);
    }
  }, [state.websiteUrl, inputUrl]);

  const isSaving = state.websiteStatus === "saving";
  const isSuccess = state.websiteStatus === "success";
  const isError = state.websiteStatus === "error";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || isSaving) return;

    let formattedUrl = inputUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
      setInputUrl(formattedUrl);
    }

    const res = await analyzeWebsite(formattedUrl);
    if (res.success) {
      onAnalyzed?.();
    }
  };

  const handleContinue = () => {
    if (onNext) {
      onNext();
    } else {
      goNext();
    }
  };

  return (
    <section className="rounded-[30px] border border-slate-900/5 bg-white/80 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-600">
          <Sparkles className="h-3.5 w-3.5" /> Step 1 of 5
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
          Connect your website
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Enter your domain to automatically crawl pages, extract core knowledge, and build your AI&apos;s initial dataset.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">Website URL</label>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2 shadow-sm transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50">
            <Globe className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://acmestore.com"
              disabled={isSaving}
              className="flex-1 h-9 text-sm text-slate-900 bg-transparent outline-none placeholder:text-slate-400 disabled:opacity-50"
              required
            />
            {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
            {isSaving && (
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium">
                <Loader2 className="h-4 w-4 animate-spin" />
                Crawling...
              </div>
            )}
            {!isSaving && (
              <Button
                type="submit"
                className="h-9 rounded-xl bg-slate-950 px-4 text-xs font-medium text-white hover:bg-slate-800 transition shadow-sm"
              >
                {isSuccess ? "Re-crawl" : "Analyze & Ingest"}
              </Button>
            )}
          </div>
        </div>

        {isError && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-800 animate-in fade-in">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <span>{state.websiteError ?? "Failed to crawl website. Please verify the URL and try again."}</span>
          </div>
        )}

        {isSuccess && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3.5 text-sm font-medium text-emerald-900 shadow-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              Website successfully crawled and indexed into vector memory.
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <FileCheck className="h-4 w-4 text-indigo-500" /> Pages Discovered
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {state.websiteSummary?.pageCount ?? 1} {state.websiteSummary?.pageCount === 1 ? "Page" : "Pages"}
                </div>
                <p className="mt-1 text-xs text-slate-500">Indexed for immediate reference</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <Layers className="h-4 w-4 text-indigo-500" /> Chunks Generated
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {state.websiteSummary?.chunkCount ?? 0} Chunks
                </div>
                <p className="mt-1 text-xs text-slate-500">Embedded with Gemini RAG</p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
              <Button
                onClick={handleContinue}
                type="button"
                className="h-11 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-medium text-white transition hover:bg-slate-800 shadow-sm"
              >
                Continue to Sources
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}