"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import {
  Globe,
  FileText,
  HelpCircle,
  CheckCircle2,
  Brain,
  Upload,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWizard, type SourceRow } from "@/lib/wizard/wizard-context";

function GraphNode({
  icon: Icon,
  label,
  sublabel,
  x,
  y,
  active,
}: {
  icon: any;
  label: string;
  sublabel: string;
  x: string;
  y: string;
  active?: boolean;
}) {
  return (
    <div
      className="absolute flex flex-col items-center gap-1.5 transition-transform duration-500 hover:scale-105"
      style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm ${
          active
            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
            : "border-slate-200 bg-white text-slate-500"
        }`}
      >
        <Icon className="h-5 w-5" />
        {active && (
          <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-0.5 text-white ring-2 ring-white">
            <CheckCircle2 className="h-3 w-3" />
          </div>
        )}
      </div>
      <div className="text-center max-w-[90px]">
        <div className="text-[11px] font-semibold text-slate-900 truncate">{label}</div>
        <div className="text-[9px] text-slate-500 truncate">{sublabel}</div>
      </div>
    </div>
  );
}

export function SourcesStepPanel() {
  const { state, addFileSource, addQnaSource, deleteSource } = useWizard();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showQnaForm, setShowQnaForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isSubmittingQna, setIsSubmittingQna] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);

    const res = await addFileSource(file);
    if (!res.success) {
      setErrorMsg(res.error ?? "Failed to upload file source.");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleQnaSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim() || isSubmittingQna) return;
    setErrorMsg(null);
    setIsSubmittingQna(true);

    const res = await addQnaSource(question.trim(), answer.trim());
    setIsSubmittingQna(false);

    if (res.success) {
      setQuestion("");
      setAnswer("");
      setShowQnaForm(false);
    } else {
      setErrorMsg(res.error ?? "Failed to add Q&A pair.");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteSource(id);
  };

  const sources = state.sources;
  const completedCount = sources.filter((s) => s.status === "completed").length;

  // Node placements around graph center
  const positions = [
    { x: "50%", y: "18%" },
    { x: "82%", y: "45%" },
    { x: "72%", y: "82%" },
    { x: "28%", y: "82%" },
    { x: "18%", y: "45%" },
  ];

  return (
    <section className="rounded-[30px] border border-slate-900/5 bg-white/80 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-600">
          <Sparkles className="h-3.5 w-3.5" /> Step 2 of 5
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
          Build your knowledge base
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Add PDF files, custom FAQs, or extra markdown documents to enrich your assistant&apos;s knowledge base.
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf,.txt,.md,.doc,.docx"
        className="hidden"
      />

      {errorMsg && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          {errorMsg}
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.3fr]">
        {/* Left Side: Actions & Source List */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-slate-950">Active Knowledge Sources</div>
                <div className="text-xs text-slate-500">{sources.length} sources added to memory</div>
              </div>
              {state.sourcesLoading && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={state.sourcesLoading}
                className="h-10 border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 hover:bg-slate-100 flex items-center gap-2 rounded-xl"
              >
                <Upload className="h-3.5 w-3.5 text-indigo-600" />
                Upload PDF / File
              </Button>

              <Button
                variant="secondary"
                onClick={() => setShowQnaForm(!showQnaForm)}
                disabled={state.sourcesLoading}
                className="h-10 border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 hover:bg-slate-100 flex items-center gap-2 rounded-xl"
              >
                <Plus className="h-3.5 w-3.5 text-amber-600" />
                Add FAQ Pair
              </Button>
            </div>

            {/* Add Q&A Form */}
            {showQnaForm && (
              <form onSubmit={handleQnaSubmit} className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-3">
                <div className="text-xs font-semibold text-indigo-950">Add Custom Q&A Pair</div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600">Question</label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. What is your refund policy?"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600">Answer</label>
                  <textarea
                    rows={2}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="e.g. We offer a 30-day money-back guarantee."
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowQnaForm(false)}
                    className="h-7 text-xs text-slate-500"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingQna}
                    className="h-7 rounded-lg bg-indigo-600 px-3 text-xs text-white hover:bg-indigo-700"
                  >
                    {isSubmittingQna ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Pair"}
                  </Button>
                </div>
              </form>
            )}

            {/* Sources List */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {sources.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  No custom sources added yet. Use the buttons above to add documents or FAQs.
                </div>
              ) : (
                sources.map((src: SourceRow) => {
                  const isWeb = src.type === "website";
                  const isQna = src.type === "qna";
                  const title = isWeb
                    ? src.input_url ?? "Website URL"
                    : isQna
                    ? src.file_name ?? "FAQ Pair"
                    : src.file_name ?? "Document";

                  const Icon = isWeb ? Globe : isQna ? HelpCircle : FileText;

                  return (
                    <div
                      key={src.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 shadow-2xs hover:bg-white hover:border-slate-200 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 shadow-2xs">
                          <Icon className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate max-w-[180px]">{title}</div>
                          <div className="text-[10px] text-slate-500 capitalize flex items-center gap-1.5">
                            <span>{src.type}</span>
                            <span>•</span>
                            <span className={src.status === "completed" ? "text-emerald-600 font-medium" : "text-amber-600"}>
                              {src.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(src.id)}
                        title="Delete source"
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Graph Visualization */}
        <div className="flex flex-col gap-4">
          <div className="relative flex flex-1 flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <div className="text-sm font-semibold text-slate-950">Knowledge Graph</div>
              <div className="text-xs text-slate-500">Visualization of memory connections</div>
            </div>

            <div className="relative mt-2 min-h-[300px] flex-1 overflow-hidden rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 border-dashed" />
              <div className="absolute left-1/2 top-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 border-dashed" />

              {/* Center Brain Node */}
              <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md border border-indigo-100">
                <div className="flex flex-col items-center text-center">
                  <Brain className="h-6 w-6 text-indigo-600" />
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600 mt-1">
                    Knowledge
                  </div>
                </div>
              </div>

              {/* Dynamic Source Nodes */}
              {sources.slice(0, 5).map((src: SourceRow, idx: number) => {
                const pos = positions[idx % positions.length];
                const Icon = src.type === "website" ? Globe : src.type === "qna" ? HelpCircle : FileText;
                const label = src.input_url ? new URL(src.input_url).hostname : src.file_name ?? src.type;
                return (
                  <GraphNode
                    key={src.id}
                    icon={Icon}
                    label={label}
                    sublabel={src.status}
                    x={pos.x}
                    y={pos.y}
                    active={src.status === "completed"}
                  />
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
              <div>
                <div className="text-lg font-bold text-slate-900">{sources.length}</div>
                <div className="text-[10px] text-slate-500">Sources Total</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">{completedCount}</div>
                <div className="text-[10px] text-slate-500">Indexed & Ready</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">Vector</div>
                <div className="text-[10px] text-slate-500">Gemini RAG</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

