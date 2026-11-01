"use client";

import { FileText, Globe, HelpCircle, Loader2, RefreshCw, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import type { SourceRow } from "@/lib/wizard/wizard-context";

const ICONS = { website: Globe, file: FileText, qna: HelpCircle } as const;

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  pending: "bg-slate-100 text-slate-600",
  crawling: "bg-indigo-100 text-indigo-700",
  extracting: "bg-indigo-100 text-indigo-700",
  chunking: "bg-indigo-100 text-indigo-700",
  embedding: "bg-indigo-100 text-indigo-700",
};

const IN_PROGRESS = new Set(["pending", "crawling", "extracting", "chunking", "embedding"]);

export function SourceCard({
  source,
  onDelete,
  onRetry,
  busy,
}: {
  source: SourceRow;
  onDelete?: (id: string) => void;
  onRetry?: (id: string) => void;
  busy?: boolean;
}) {
  const Icon = ICONS[source.type];
  const title = source.type === "website" ? source.input_url : source.file_name;
  const inProgress = IN_PROGRESS.has(source.status);

  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.03)]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-slate-950">{title || "Untitled source"}</div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
          <span className="capitalize">{source.type}</span>
          {source.page_count ? <span>· {source.page_count} pages</span> : null}
        </div>
        {source.status === "failed" && source.error_message && (
          <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {source.error_message}
          </div>
        )}
      </div>

      <div
        className={[
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
          STATUS_STYLES[source.status] ?? "bg-slate-100 text-slate-600",
        ].join(" ")}
      >
        {inProgress && <Loader2 className="h-3 w-3 animate-spin" />}
        {source.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
        {source.status}
      </div>

      {source.status === "failed" && onRetry && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onRetry(source.id)}
          className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
          title="Retry"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onDelete(source.id)}
          className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          title="Remove"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
