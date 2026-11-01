"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function IntegrationCard({
  title,
  description,
  language,
  code,
}: {
  title: string;
  description: string;
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-[26px] border border-slate-900/10 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-slate-950">{title}</div>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-200">
        <code>{code}</code>
      </pre>
      <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">{language}</div>
    </div>
  );
}
