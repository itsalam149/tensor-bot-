"use client";

import { AssistantSidebar } from "@/components/create-assistant/assistant-sidebar";
import { MessageSquare, CheckCircle2, Zap, Users, ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

export default function AnalyticsPage() {
  const params = useParams();
  const assistantId = params?.id as string;
  
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [dateRange, setDateRange] = useState("Last 30 Days");

  const dateOptions = ["Today", "Last 7 Days", "Last 30 Days", "This Year", "All Time"];

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_1fr]">
        <AssistantSidebar assistantId={assistantId} />
        <main className="flex min-w-0 flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1160px] flex-1 flex-col">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Analytics</h1>
                <p className="mt-1 text-sm text-slate-500">Track usage, queries, and assistant performance.</p>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setDateRangeOpen(!dateRangeOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  {dateRange} <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                {dateRangeOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-1 shadow-lg z-10">
                    {dateOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setDateRange(opt);
                          setDateRangeOpen(false);
                          toast.success(`Analytics updated to ${opt}`);
                        }}
                        className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${dateRange === opt ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <TrendingUp className="h-3 w-3" /> +12%
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-semibold text-slate-950">24.5k</div>
                  <div className="text-sm text-slate-500">Total Conversations</div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <TrendingUp className="h-3 w-3" /> +2.1%
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-semibold text-slate-950">94.2%</div>
                  <div className="text-sm text-slate-500">Resolution Rate</div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-rose-600">
                    <TrendingDown className="h-3 w-3" /> -0.4s
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-semibold text-slate-950">1.2s</div>
                  <div className="text-sm text-slate-500">Avg Response Time</div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <TrendingUp className="h-3 w-3" /> +0.2
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-semibold text-slate-950">4.8/5</div>
                  <div className="text-sm text-slate-500">User Satisfaction</div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px]">
              {/* Chart Placeholder */}
              <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-semibold text-slate-950">Conversations over time</h3>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-500"></span> Bot resolved</div>
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-300"></span> Escalated</div>
                  </div>
                </div>
                <div className="h-[280px] w-full flex items-end justify-between gap-2 border-b border-slate-100 pb-2">
                  {[40, 60, 30, 80, 50, 90, 70, 85, 45, 65, 55, 95].map((height, i) => (
                    <div key={i} className="w-full bg-slate-50 rounded-t-lg flex flex-col justify-end group cursor-pointer hover:bg-slate-100 transition">
                      <div className="w-full bg-indigo-500 rounded-t-lg transition-all group-hover:bg-indigo-600" style={{ height: `${height}%` }}></div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between text-[11px] font-medium text-slate-400">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                </div>
              </div>

              {/* Recent Queries */}
              <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-slate-950">Recent Queries</h3>
                  <button onClick={() => toast.info('Loading full query logs...')} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">View all</button>
                </div>
                <div className="space-y-5">
                  {[
                    { q: "How do I process a return?", time: "2 mins ago", status: "Resolved", conf: "98%" },
                    { q: "Where is my order #4829?", time: "15 mins ago", status: "Resolved", conf: "95%" },
                    { q: "Do you ship to Canada?", time: "1 hour ago", status: "Resolved", conf: "99%" },
                    { q: "I need to talk to a human.", time: "2 hours ago", status: "Escalated", conf: "45%" },
                    { q: "What are your business hours?", time: "3 hours ago", status: "Resolved", conf: "99%" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start justify-between border-b border-slate-50 pb-5 last:border-0 last:pb-0">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{item.q}</div>
                        <div className="mt-1 text-xs text-slate-500">{item.time}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${item.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {item.status}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">{item.conf} conf</span>
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
