"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AssistantSidebar } from "@/components/create-assistant/assistant-sidebar";
import { Bot, Search, Plus, MoreVertical, Globe, Database, Trash2, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { botsApi, type ApiBot } from "@/lib/wizard/api-client";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bots, setBots] = useState<ApiBot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBots = async () => {
    setLoading(true);
    const res = await botsApi.listSources?.("all") as any; // fetch bots list
    try {
      const response = await fetch("/api/bots");
      const data = await response.json();
      if (data.success && Array.isArray(data.bots)) {
        setBots(data.bots);
      }
    } catch {
      toast.error("Failed to load your assistants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    const res = await botsApi.deleteSource(id, "bot");
    try {
      const response = await fetch(`/api/bots/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        toast.success(`${name} deleted`);
        setBots((prev) => prev.filter((b) => b.id !== id));
      } else {
        toast.error(data.error ?? "Failed to delete assistant.");
      }
    } catch {
      toast.error("Failed to delete assistant.");
    }
  };

  const filteredBots = bots.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.website_url ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 selection:bg-zinc-200">
      <div className="mx-auto grid min-h-screen lg:grid-cols-[260px_1fr]">
        <AssistantSidebar />
        <main className="flex min-w-0 flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1160px] flex-1 flex-col">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">My Assistants</h1>
                <p className="mt-1 text-sm text-zinc-500">Manage your deployed AI assistants, sources, and settings.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search assistants..."
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 text-sm outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100 sm:w-64 shadow-sm"
                  />
                </div>
                <Link
                  href="/create"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Create New
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-950" />
                  Loading your assistants...
                </div>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBots.map((bot) => (
                  <div
                    key={bot.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                          <Bot className="h-5 w-5" />
                        </div>

                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            bot.status === "ready"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {bot.status === "ready" ? "Active" : bot.status}
                        </span>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-base font-semibold tracking-tight text-zinc-950">{bot.name}</h3>
                        <p className="mt-1 text-xs text-zinc-500 truncate">
                          {bot.website_url ? (
                            <span className="flex items-center gap-1.5 text-indigo-600 font-medium">
                              <Globe className="h-3.5 w-3.5 shrink-0" />
                              {bot.website_url}
                            </span>
                          ) : (
                            "No URL connected"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto border-t border-zinc-100 p-4 bg-zinc-50/50 rounded-b-2xl flex items-center justify-between">
                      <span className="text-[11px] text-zinc-400">
                        {new Date(bot.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link
                          href="/create"
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition"
                          title="Open Assistant"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(bot.id, bot.name)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Assistant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Create New Assistant Card */}
                <Link
                  href="/create"
                  className="group flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center transition-all hover:border-zinc-400 hover:bg-zinc-50/50 shadow-sm min-h-[220px]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 group-hover:bg-zinc-950 group-hover:text-white transition-colors">
                    <Plus className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold tracking-tight text-zinc-950">Create New Assistant</h3>
                  <p className="mt-1 text-xs text-zinc-500 max-w-[200px]">Crawl domain, upload documents, and deploy RAG bot.</p>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

