"use client";

import { AssistantSidebar } from "@/components/create-assistant/assistant-sidebar";
import { MessageSquare, CheckCircle2, Zap, Users, ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [dateRange, setDateRange] = useState("Last 30 Days");

  const dateOptions = ["Today", "Last 7 Days", "Last 30 Days", "This Year", "All Time"];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 selection:bg-zinc-200">
      <div className="mx-auto grid min-h-screen lg:grid-cols-[260px_1fr]">
        <AssistantSidebar />
        <main className="flex min-w-0 flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1160px] flex-1 flex-col">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-zinc-950">Analytics</h1>
                <p className="mt-1 text-sm text-zinc-500">Track usage, queries, and assistant performance.</p>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setDateRangeOpen(!dateRangeOpen)}
                  className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                >
                  {dateRange} <ChevronDown className="h-4 w-4 text-zinc-400" />
                </button>
                {dateRangeOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg z-10 animate-in fade-in zoom-in-95 duration-200">
                    {dateOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setDateRange(opt);
                          setDateRangeOpen(false);
                          toast.success(`Analytics updated to ${opt}`);
                        }}
                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${dateRange === opt ? 'bg-zinc-100 text-zinc-900 font-medium' : 'text-zinc-700 hover:bg-zinc-50'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200/50">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <TrendingUp className="h-3 w-3" /> +12%
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-semibold tracking-tight text-zinc-950">24.5k</div>
                  <div className="text-xs text-zinc-500 mt-1">Total Conversations</div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200/50">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <TrendingUp className="h-3 w-3" /> +2.1%
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-semibold tracking-tight text-zinc-950">94.2%</div>
                  <div className="text-xs text-zinc-500 mt-1">Resolution Rate</div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200/50">
                    <Zap className="h-4 w-4" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <TrendingDown className="h-3 w-3" /> -0.4s
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-semibold tracking-tight text-zinc-950">1.2s</div>
                  <div className="text-xs text-zinc-500 mt-1">Avg Response Time</div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200/50">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <TrendingUp className="h-3 w-3" /> +0.2
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-semibold tracking-tight text-zinc-950">4.8/5</div>
                  <div className="text-xs text-zinc-500 mt-1">User Satisfaction</div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_400px]">
              {/* Chart Placeholder */}
              <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-semibold tracking-tight text-zinc-950">Conversations over time</h3>
                  <div className="flex items-center gap-4 text-[11px] font-medium text-zinc-500">
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded bg-zinc-950"></span> Bot resolved</div>
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded bg-zinc-200"></span> Escalated</div>
                  </div>
                </div>
                <div className="h-[280px] w-full flex items-end justify-between gap-2 border-b border-zinc-100 pb-2">
                  {[40, 60, 30, 80, 50, 90, 70, 85, 45, 65, 55, 95].map((height, i) => (
                    <div key={i} className="w-full bg-zinc-100 rounded-sm flex flex-col justify-end group cursor-pointer hover:bg-zinc-200 transition">
                      <div className="w-full bg-zinc-950 rounded-sm transition-all group-hover:bg-zinc-800" style={{ height: `${height}%` }}></div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between text-[10px] font-medium uppercase tracking-widest text-zinc-400">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                </div>
              </div>

              {/* Recent Queries */}
              <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold tracking-tight text-zinc-950">Recent Queries</h3>
                  <button onClick={() => toast.info('Loading full query logs...')} className="text-[11px] font-medium text-zinc-900 hover:text-zinc-600">View all</button>
                </div>
                <div className="space-y-4">
                  {[
                    { q: "How do I process a return?", time: "2 mins ago", status: "Resolved", conf: "98%" },
                    { q: "Where is my order #4829?", time: "15 mins ago", status: "Resolved", conf: "95%" },
                    { q: "Do you ship to Canada?", time: "1 hour ago", status: "Resolved", conf: "99%" },
                    { q: "I need to talk to a human.", time: "2 hours ago", status: "Escalated", conf: "45%" },
                    { q: "What are your business hours?", time: "3 hours ago", status: "Resolved", conf: "99%" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start justify-between border-b border-zinc-100 pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="text-sm font-medium tracking-tight text-zinc-900">{item.q}</div>
                        <div className="mt-1 text-[11px] text-zinc-500">{item.time}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`inline-flex rounded border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest ${item.status === 'Resolved' ? 'border-emerald-200/50 bg-emerald-50 text-emerald-700' : 'border-rose-200/50 bg-rose-50 text-rose-700'}`}>
                          {item.status}
                        </span>
                        <span className="text-[10px] font-medium text-zinc-400">{item.conf} conf</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
