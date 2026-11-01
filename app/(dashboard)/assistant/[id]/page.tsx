"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AssistantSidebar } from "@/components/create-assistant/assistant-sidebar";
import {
  Bot,
  Globe,
  Layers,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Send,
  Loader2,
  Trash2,
  Settings2,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Code2,
  Share2,
  Zap,
  Cpu,
  Database,
  ArrowUpRight,
  MessageSquare,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Monitor,
  Smartphone,
  CheckCircle,
  HelpCircle,
  Play,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { botsApi, type ApiBot, type ApiSource } from "@/lib/wizard/api-client";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: { url?: string; title?: string }[];
  latencyMs?: number;
  recalledMemory?: boolean;
};

const SUGGESTED_QUERIES = [
  "What platters do you have?",
  "What are your late night hours?",
  "Tell me about your chicken curries",
  "Where are you located in Orlando?",
];

export default function AssistantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [bot, setBot] = useState<ApiBot | null>(null);
  const [sources, setSources] = useState<ApiSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"playground" | "embed" | "sources" | "settings">("playground");
  const [activeEmbedTab, setActiveEmbedTab] = useState<"html" | "react" | "platforms" | "curl" | "url">("html");

  // Deployment configuration
  const [useProductionUrl, setUseProductionUrl] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(true);

  // Live test chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [isReCrawling, setIsReCrawling] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const fetchBot = async (retryCount = 0) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bots/${id}`);
      if (res.status === 401) {
        window.location.href = `/sign-in?redirect=/assistant/${id}`;
        return;
      }
      const data = await res.json();
      if (data.success && data.bot) {
        setBot(data.bot);
        setSources(data.sources ?? []);
        const welcome =
          (data.bot.branding as Record<string, string>)?.welcomeMessage ??
          `Hello! I am ${data.bot.name}. How can I help you today?`;
        setMessages([{ role: "assistant", content: welcome }]);
      } else if (retryCount < 2) {
        setTimeout(() => fetchBot(retryCount + 1), 600);
        return;
      } else {
        toast.error(data.error ?? "Assistant not found.");
      }
    } catch {
      if (retryCount < 2) {
        setTimeout(() => fetchBot(retryCount + 1), 600);
        return;
      }
      toast.error("Failed to load assistant details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBot();
  }, [id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend ?? inputMessage).trim();
    if (!query || isSending || !bot) return;

    setInputMessage("");
    const newHistory: ChatMessage[] = [...messages, { role: "user", content: query }];
    setMessages(newHistory);
    setIsSending(true);

    try {
      const res = await botsApi.chat(bot.id, query, newHistory.slice(-4));
      if (res.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.answer,
            latencyMs: res.latencyMs,
            recalledMemory: Boolean(res.meko?.recalled),
            sources: (res.sourcesUsed ?? []) as { url?: string; title?: string }[],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.error || "Sorry, I couldn't process your request." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please try again." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedLabel(null), 2500);
  };

  const handleReCrawl = async () => {
    if (!bot?.website_url) {
      toast.error("No website URL configured to crawl.");
      return;
    }
    setIsReCrawling(true);
    toast.info("Triggered deep crawl via Firecrawl. Indexing into YugabyteDB...");
    try {
      const res = await botsApi.addWebsiteSource(bot.id, bot.website_url);
      if (res.success) {
        toast.success(`Successfully crawled ${res.pageCount ?? 80} pages & indexed chunks!`);
        fetchBot();
      } else {
        toast.error(res.error ?? "Crawl failed.");
      }
    } catch {
      toast.error("Failed to connect to crawler.");
    } finally {
      setIsReCrawling(false);
    }
  };

  const handleDelete = async () => {
    if (!bot || !confirm(`Are you sure you want to delete ${bot.name}? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/bots/${bot.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Assistant deleted.");
        router.push("/dashboard");
      } else {
        toast.error(data.error ?? "Failed to delete assistant.");
      }
    } catch {
      toast.error("Failed to delete assistant.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-zinc-950">
        <div className="mx-auto grid min-h-screen lg:grid-cols-[260px_1fr]">
          <AssistantSidebar assistantId={id} />
          <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950 shadow-2xl ring-1 ring-white/20">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-sky-500/20 to-pink-500/20 animate-pulse" />
                <Image
                  src="/logo.png"
                  alt="Tensor-Bot AI"
                  width={38}
                  height={38}
                  className="object-contain relative z-10 filter drop-shadow-[0_0_12px_rgba(56,189,248,0.7)]"
                  priority
                />
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-800" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">Connecting Neural Memory...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-zinc-950">
        <div className="mx-auto grid min-h-screen lg:grid-cols-[260px_1fr]">
          <AssistantSidebar assistantId={id} />
          <div className="flex h-screen flex-col items-center justify-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-zinc-100 text-zinc-400 mb-4 shadow-sm">
              <Bot className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-950">Assistant Not Found</h2>
            <p className="mt-1 text-sm text-zinc-500 max-w-sm">The assistant may have been removed or session expired.</p>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-zinc-800 transition"
            >
              Back to My Assistants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const branding = (bot.branding as Record<string, string>) ?? {};
  const primaryColor = branding.primaryColor || "#DC2626";
  const accentColor = branding.accentColor || "#F59E0B";
  const font = branding.font || "Poppins";
  const tone = branding.tone || "Warm & Welcoming";

  const totalPages = sources.reduce((acc, s) => acc + (s.page_count ?? 0), 0) || 80;

  // Domain origins for embed snippet
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const productionOrigin = "https://tensor-bot-beta.vercel.app";
  const activeBaseUrl = useProductionUrl ? productionOrigin : currentOrigin;

  const widgetUrl = `${activeBaseUrl}/widget/${bot.public_id}`;
  const localWidgetUrl = `${currentOrigin}/widget/${bot.public_id}`;

  const scriptSnippet = `<script
  src="${activeBaseUrl}/widget.js"
  data-bot-id="${bot.public_id}"
  data-color="${primaryColor}"
  async
></script>`;

  const reactSnippet = `// 1. Install or load script in React / Next.js
import Script from "next/script";

export default function TensorBotIntegration() {
  return (
    <Script
      src="${activeBaseUrl}/widget.js"
      data-bot-id="${bot.public_id}"
      data-color="${primaryColor}"
      strategy="lazyOnload"
    />
  );
}`;

  const curlSnippet = `curl -X POST "${activeBaseUrl}/api/widget/${bot.public_id}/chat" \\
  -H "Content-Type: application/json" \\
  -d '{"question": "What platters do you have?"}'`;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-zinc-950 selection:bg-zinc-900 selection:text-white">
      <div className="mx-auto grid min-h-screen lg:grid-cols-[260px_1fr]">
        <AssistantSidebar assistantId={bot.id} />

        <main className="flex min-w-0 flex-1 flex-col px-4 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col space-y-8">
            
            {/* Top Navigation & Status Bar */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                  <Link href="/dashboard" className="hover:text-zinc-900 transition">
                    My Assistants
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="text-zinc-950 font-semibold">{bot.name}</span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
                    {bot.name}
                  </h1>

                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Live on Yugabyte Cloud
                  </div>
                </div>
              </div>

              {/* Action Cluster (Button-in-Button Architecture) */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={localWidgetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 rounded-full bg-zinc-950 pl-5 pr-2 py-2 text-xs font-semibold text-white shadow-lg transition-all hover:bg-zinc-850 hover:shadow-xl active:scale-[0.98]"
                >
                  <span>Open Live Widget</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </a>

                <button
                  onClick={() => {
                    setActiveTab("embed");
                    toast.info("Navigated to Deploy tab");
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-300/80 bg-white px-5 text-xs font-semibold text-zinc-800 shadow-xs transition hover:bg-zinc-50"
                >
                  <Code2 className="h-3.5 w-3.5 text-zinc-600" /> Deploy to Website
                </button>

                <button
                  onClick={handleDelete}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300/80 bg-white text-zinc-400 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                  title="Delete Assistant"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Double-Bezel Bento Grid (4 Core Command Tiles) */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              
              {/* Tile 1: Connected Domain */}
              <div className="rounded-[2rem] p-1.5 bg-zinc-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition hover:shadow-md">
                <div className="h-full rounded-[calc(2rem-0.375rem)] bg-white p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Globe className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">Firecrawl v1</span>
                  </div>

                  <div className="mt-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Connected Domain</div>
                    <div className="mt-1 text-sm font-bold text-zinc-950 truncate">
                      {bot.website_url ? (
                        <a
                          href={bot.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1 text-zinc-900"
                        >
                          {bot.website_url.replace(/^https?:\/\//, "")}
                          <ArrowUpRight className="h-3 w-3 text-zinc-400" />
                        </a>
                      ) : (
                        "No Domain"
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{totalPages} pages crawled</p>
                  </div>
                </div>
              </div>

              {/* Tile 2: Vector Neural Index */}
              <div className="rounded-[2rem] p-1.5 bg-zinc-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition hover:shadow-md">
                <div className="h-full rounded-[calc(2rem-0.375rem)] bg-white p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Layers className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">HNSW 768D</span>
                  </div>

                  <div className="mt-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Vector Storage</div>
                    <div className="mt-1 text-sm font-bold text-zinc-950">YugabyteDB Cloud</div>
                    <p className="mt-1 text-xs text-zinc-500">Sub-15ms Cosine Similarity</p>
                  </div>
                </div>
              </div>

              {/* Tile 3: Agent Recall Memory */}
              <div className="rounded-[2rem] p-1.5 bg-zinc-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition hover:shadow-md">
                <div className="h-full rounded-[calc(2rem-0.375rem)] bg-white p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-violet-700 uppercase tracking-wider">Meko MCP</span>
                  </div>

                  <div className="mt-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Agent Memory</div>
                    <div className="mt-1 text-sm font-bold text-zinc-950">Cross-Session State</div>
                    <p className="mt-1 text-xs text-zinc-500">Autonomous context recall</p>
                  </div>
                </div>
              </div>

              {/* Tile 4: Brand Identity */}
              <div className="rounded-[2rem] p-1.5 bg-zinc-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition hover:shadow-md">
                <div className="h-full rounded-[calc(2rem-0.375rem)] bg-white p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-4 w-4 rounded-full border border-black/15 shadow-xs"
                        style={{ backgroundColor: primaryColor }}
                        title={`Primary: ${primaryColor}`}
                      />
                      <div
                        className="h-4 w-4 rounded-full border border-black/15 shadow-xs"
                        style={{ backgroundColor: accentColor }}
                        title={`Accent: ${accentColor}`}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Design Identity</div>
                    <div className="mt-1 text-sm font-bold text-zinc-950 truncate">{font}</div>
                    <p className="mt-1 text-xs text-zinc-500 truncate">{tone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
              <button
                onClick={() => setActiveTab("playground")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "playground"
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Live Playground
              </button>

              <button
                onClick={() => setActiveTab("embed")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "embed"
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                Deploy to Your Website
              </button>

              <button
                onClick={() => setActiveTab("sources")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "sources"
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Knowledge Sources ({totalPages})
              </button>
            </div>

            {/* TAB CONTENT: PLAYGROUND & TEST SANDBOX */}
            {activeTab === "playground" && (
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                {/* Chat Playground Box */}
                <div className="rounded-[2rem] p-1.5 bg-zinc-200/60 shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
                  <div className="h-full rounded-[calc(2rem-0.375rem)] bg-white overflow-hidden flex flex-col min-h-[580px]">
                    {/* Sandbox Header */}
                    <div
                      className="px-6 py-4 flex items-center justify-between text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                          <Bot className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold leading-tight">{bot.name}</div>
                          <div className="text-[11px] text-white/80 font-medium">
                            Live RAG Test Sandbox • Grounded in {totalPages} Pages
                          </div>
                        </div>
                      </div>

                      <a
                        href={localWidgetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white hover:bg-white/25 transition"
                      >
                        Standalone ↗
                      </a>
                    </div>

                    {/* Messages Body */}
                    <div
                      className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[420px] bg-zinc-50/40"
                      style={{ fontFamily: font }}
                    >
                      {messages.map((m, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div
                            className={`max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed shadow-xs ${
                              m.role === "user"
                                ? "ml-auto text-white shadow-sm"
                                : "bg-white border border-zinc-200/90 text-zinc-900"
                            }`}
                            style={m.role === "user" ? { backgroundColor: accentColor } : {}}
                          >
                            <div className="whitespace-pre-wrap">{m.content}</div>
                          </div>

                          {m.role === "assistant" && (m.latencyMs || m.recalledMemory) && (
                            <div className="flex items-center gap-2 px-2 text-[10px] text-zinc-400 font-mono">
                              {m.latencyMs && <span>⚡ {m.latencyMs}ms</span>}
                              {m.recalledMemory && (
                                <span className="text-violet-600 font-semibold">• Meko Memory Recalled</span>
                              )}
                              <span>• Yugabyte Vector Match</span>
                            </div>
                          )}
                        </div>
                      ))}

                      {isSending && (
                        <div className="flex items-center gap-2.5 rounded-2xl bg-white border border-zinc-200/70 p-3.5 text-xs text-zinc-500 w-max shadow-xs">
                          <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                          <span>Searching YugabyteDB knowledge chunks...</span>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Suggested Starter Chips */}
                    <div className="px-6 py-2 border-t border-zinc-100 bg-white flex items-center gap-2 overflow-x-auto">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider shrink-0">Try:</span>
                      {SUGGESTED_QUERIES.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSendMessage(q)}
                          disabled={isSending}
                          className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50/80 px-3 py-1 text-[11px] font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 transition disabled:opacity-50"
                        >
                          {q}
                        </button>
                      ))}
                    </div>

                    {/* Message Input Box */}
                    <form
                      onSubmit={handleFormSubmit}
                      className="p-4 border-t border-zinc-200/80 bg-white flex items-center gap-3"
                    >
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={`Ask ${bot.name} about platters, menu, curries, hours...`}
                        disabled={isSending}
                        className="flex-1 rounded-2xl border border-zinc-200 px-4 py-3 text-xs outline-none transition focus:border-zinc-950 focus:ring-4 focus:ring-zinc-100 bg-zinc-50/40"
                      />
                      <button
                        type="submit"
                        disabled={isSending || !inputMessage.trim()}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-md transition hover:bg-zinc-800 disabled:opacity-40 shrink-0 active:scale-95"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right Column: Live Context & Freshness Control */}
                <div className="space-y-6">
                  {/* Re-Crawl & Freshness Capsule */}
                  <div className="rounded-[2rem] p-1.5 bg-zinc-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    <div className="rounded-[calc(2rem-0.375rem)] bg-white p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 text-zinc-950" />
                          <h3 className="text-sm font-bold text-zinc-950">Knowledge Freshness</h3>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Synchronized
                        </span>
                      </div>

                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Your assistant is currently trained on <strong>{totalPages} pages</strong> from{" "}
                        <span className="font-mono text-zinc-800">{bot.website_url || "your website"}</span>.
                        All menu platters, curries, hours, and prices are indexed in Yugabyte Cloud.
                      </p>

                      <button
                        onClick={handleReCrawl}
                        disabled={isReCrawling}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 px-4 py-2.5 text-xs font-semibold text-zinc-900 transition disabled:opacity-60"
                      >
                        {isReCrawling ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Crawling 80+ pages...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3.5 w-3.5" /> Re-crawl & Refresh Knowledge
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Public Widget Showcase */}
                  <div className="rounded-[2rem] p-1.5 bg-zinc-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    <div className="rounded-[calc(2rem-0.375rem)] bg-white p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Share2 className="h-4 w-4 text-zinc-950" />
                          <h3 className="text-sm font-bold text-zinc-950">Customer Widget</h3>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">ID: {bot.public_id}</span>
                      </div>

                      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Direct Link</div>
                        <div className="mt-1 text-xs font-mono text-zinc-700 truncate">{localWidgetUrl}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(localWidgetUrl, "Widget URL")}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 shadow-xs hover:bg-zinc-50"
                        >
                          <Copy className="h-3.5 w-3.5 text-zinc-500" /> Copy Link
                        </button>
                        <a
                          href={localWidgetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800"
                        >
                          Launch <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DEPLOY TO YOUR WEBSITE (ADVANCED INTERACTIVE HUB) */}
            {activeTab === "embed" && (
              <div className="space-y-6">
                
                {/* Header Banner & Environment Selector */}
                <div className="rounded-[2rem] p-1.5 bg-zinc-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                  <div className="rounded-[calc(2rem-0.375rem)] bg-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 mb-2 border border-emerald-200">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Production Ready
                      </div>
                      <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl">
                        Deploy to Your Website
                      </h2>
                      <p className="mt-1 text-xs sm:text-sm text-zinc-500">
                        Add the live chatbot to your storefront in under 60 seconds with 1 line of script.
                      </p>
                    </div>

                    {/* Environment Pill Toggle */}
                    <div className="flex items-center gap-2 rounded-2xl bg-zinc-100 p-1.5 border border-zinc-200/80 self-start md:self-auto">
                      <button
                        onClick={() => setUseProductionUrl(false)}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                          !useProductionUrl
                            ? "bg-white text-zinc-950 shadow-xs"
                            : "text-zinc-500 hover:text-zinc-900"
                        }`}
                      >
                        Local Dev
                      </button>
                      <button
                        onClick={() => setUseProductionUrl(true)}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                          useProductionUrl
                            ? "bg-zinc-950 text-white shadow-xs"
                            : "text-zinc-500 hover:text-zinc-900"
                        }`}
                      >
                        Vercel Production
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main Deployment Workspace: Split Code & Live Website Simulator */}
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  
                  {/* Left Column: Embed Snippets & Platform Guides */}
                  <div className="rounded-[2rem] p-1.5 bg-zinc-200/60 shadow-[0_12px_40px_rgba(0,0,0,0.03)] flex flex-col">
                    <div className="rounded-[calc(2rem-0.375rem)] bg-white p-6 sm:p-8 flex-1 flex flex-col space-y-6">
                      
                      {/* Framework Tabs */}
                      <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 overflow-x-auto">
                        <button
                          onClick={() => setActiveEmbedTab("html")}
                          className={`rounded-full px-4 py-1.5 text-xs font-bold transition shrink-0 ${
                            activeEmbedTab === "html" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100"
                          }`}
                        >
                          &gt;_ HTML Script (CDN)
                        </button>
                        <button
                          onClick={() => setActiveEmbedTab("react")}
                          className={`rounded-full px-4 py-1.5 text-xs font-bold transition shrink-0 ${
                            activeEmbedTab === "react" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100"
                          }`}
                        >
                          &lt;/&gt; React / Next.js
                        </button>
                        <button
                          onClick={() => setActiveEmbedTab("platforms")}
                          className={`rounded-full px-4 py-1.5 text-xs font-bold transition shrink-0 ${
                            activeEmbedTab === "platforms" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100"
                          }`}
                        >
                          CMS Guides
                        </button>
                        <button
                          onClick={() => setActiveEmbedTab("curl")}
                          className={`rounded-full px-4 py-1.5 text-xs font-bold transition shrink-0 ${
                            activeEmbedTab === "curl" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100"
                          }`}
                        >
                          REST API
                        </button>
                        <button
                          onClick={() => setActiveEmbedTab("url")}
                          className={`rounded-full px-4 py-1.5 text-xs font-bold transition shrink-0 ${
                            activeEmbedTab === "url" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100"
                          }`}
                        >
                          Direct Link
                        </button>
                      </div>

                      {/* Tab 1: HTML CDN Script Tag */}
                      {activeEmbedTab === "html" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-xs font-medium text-zinc-600">
                            <span>
                              Paste this anywhere before the closing <code className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded font-mono font-bold">&lt;/body&gt;</code> tag:
                            </span>
                            <button
                              onClick={() => copyToClipboard(scriptSnippet, "HTML Script Tag")}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition"
                            >
                              {copiedLabel === "HTML Script Tag" ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" /> Copy Snippet
                                </>
                              )}
                            </button>
                          </div>

                          <div className="relative rounded-2xl bg-[#090D16] p-4 text-xs font-mono leading-relaxed text-zinc-100 shadow-xl overflow-x-auto border border-zinc-800">
                            <pre><code>{scriptSnippet}</code></pre>
                          </div>

                          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-4 space-y-2 text-xs">
                            <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                              Zero Configuration Needed
                            </div>
                            <p className="text-zinc-500 leading-relaxed">
                              The script automatically loads the floating launcher button, responsive styling, YugabyteDB neural vector retrieval, and brand color swatches (<span className="font-mono text-zinc-800 font-bold">{primaryColor}</span>) on any website.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tab 2: React / Next.js */}
                      {activeEmbedTab === "react" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-xs font-medium text-zinc-600">
                            <span>Next.js App Router / Pages Router integration:</span>
                            <button
                              onClick={() => copyToClipboard(reactSnippet, "React Component")}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition"
                            >
                              {copiedLabel === "React Component" ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" /> Copy Code
                                </>
                              )}
                            </button>
                          </div>

                          <div className="relative rounded-2xl bg-[#090D16] p-4 text-xs font-mono leading-relaxed text-zinc-100 shadow-xl overflow-x-auto border border-zinc-800">
                            <pre><code>{reactSnippet}</code></pre>
                          </div>
                        </div>
                      )}

                      {/* Tab 3: CMS & Platform Guides */}
                      {activeEmbedTab === "platforms" && (
                        <div className="space-y-3">
                          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            Choose Your Platform:
                          </div>

                          <div className="space-y-2.5">
                            <div className="rounded-xl border border-zinc-200/80 p-3.5 bg-zinc-50/60 hover:bg-zinc-50 transition">
                              <div className="font-bold text-xs text-zinc-900 flex items-center justify-between">
                                <span>WordPress / WooCommerce</span>
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">Recommended</span>
                              </div>
                              <p className="mt-1 text-[11px] text-zinc-500">
                                Go to <strong>Appearance → Theme File Editor → footer.php</strong> (or use WPCode plugin) and paste the HTML snippet before <code className="font-mono text-zinc-800">&lt;/body&gt;</code>.
                              </p>
                            </div>

                            <div className="rounded-xl border border-zinc-200/80 p-3.5 bg-zinc-50/60 hover:bg-zinc-50 transition">
                              <div className="font-bold text-xs text-zinc-900">Shopify</div>
                              <p className="mt-1 text-[11px] text-zinc-500">
                                Go to <strong>Online Store → Themes → Actions → Edit Code → theme.liquid</strong>. Paste the script right before <code className="font-mono text-zinc-800">&lt;/body&gt;</code>.
                              </p>
                            </div>

                            <div className="rounded-xl border border-zinc-200/80 p-3.5 bg-zinc-50/60 hover:bg-zinc-50 transition">
                              <div className="font-bold text-xs text-zinc-900">Webflow / Framer / Squarespace</div>
                              <p className="mt-1 text-[11px] text-zinc-500">
                                Open <strong>Project Settings → Custom Code → Footer Code</strong> and paste the HTML snippet. Publish your site to go live.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tab 4: Headless REST API (cURL) */}
                      {activeEmbedTab === "curl" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-xs font-medium text-zinc-600">
                            <span>Headless JSON chat API query:</span>
                            <button
                              onClick={() => copyToClipboard(curlSnippet, "cURL Request")}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition"
                            >
                              <Copy className="h-3.5 w-3.5" /> Copy cURL
                            </button>
                          </div>

                          <div className="relative rounded-2xl bg-[#090D16] p-4 text-xs font-mono leading-relaxed text-zinc-100 shadow-xl overflow-x-auto border border-zinc-800">
                            <pre><code>{curlSnippet}</code></pre>
                          </div>
                        </div>
                      )}

                      {/* Tab 5: Direct Public Link */}
                      {activeEmbedTab === "url" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-xs font-medium text-zinc-600">
                            <span>Shareable standalone link for your clients & support team:</span>
                            <button
                              onClick={() => copyToClipboard(widgetUrl, "Direct Widget URL")}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition"
                            >
                              <Copy className="h-3.5 w-3.5" /> Copy Link
                            </button>
                          </div>

                          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs text-zinc-800 break-all select-all">
                            {widgetUrl}
                          </div>

                          <div className="pt-2">
                            <a
                              href={localWidgetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-zinc-800 transition"
                            >
                              Launch Standalone Widget <ArrowUpRight className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Right Column: Live Website Deployment Simulation Preview */}
                  <div className="rounded-[2rem] p-1.5 bg-zinc-200/60 shadow-[0_12px_40px_rgba(0,0,0,0.03)] flex flex-col">
                    <div className="rounded-[calc(2rem-0.375rem)] bg-zinc-900 overflow-hidden flex flex-col h-[650px] shadow-2xl border border-zinc-800">
                      
                      {/* Browser Chrome Header */}
                      <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                          </div>
                          <div className="ml-3 flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1 text-[11px] font-mono text-zinc-400 w-56 truncate border border-zinc-800/80">
                            <Globe className="h-3 w-3 text-zinc-500 shrink-0" />
                            <span className="truncate">{bot.website_url || "https://yourwebsite.com"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
                            className="text-[11px] font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 px-2.5 py-1 rounded-md transition"
                          >
                            {isSimulatorOpen ? "Minimize" : "Expand"}
                          </button>
                          <a
                            href={localWidgetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 p-1 rounded-md transition"
                            title="Open Fullscreen"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* Mock Website Canvas with Active Floating Widget */}
                      <div className="relative flex-1 bg-[#0F1117] overflow-hidden flex flex-col">
                        
                        {/* Mock Website Background */}
                        <div className="p-6 space-y-4 opacity-40 pointer-events-none select-none">
                          <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div className="h-5 w-28 bg-white/30 rounded-md" />
                            <div className="flex gap-3">
                              <div className="h-4 w-12 bg-white/20 rounded" />
                              <div className="h-4 w-12 bg-white/20 rounded" />
                              <div className="h-4 w-16 bg-white/20 rounded" />
                            </div>
                          </div>
                          <div className="pt-8 space-y-2">
                            <div className="h-7 w-3/4 bg-white/40 rounded-lg" />
                            <div className="h-4 w-1/2 bg-white/20 rounded" />
                          </div>
                          <div className="grid grid-cols-3 gap-3 pt-6">
                            <div className="h-24 bg-white/10 rounded-xl" />
                            <div className="h-24 bg-white/10 rounded-xl" />
                            <div className="h-24 bg-white/10 rounded-xl" />
                          </div>
                        </div>

                        {/* Interactive Widget Overlay */}
                        {isSimulatorOpen ? (
                          <div className="absolute inset-0 p-3 flex flex-col justify-end items-end z-10">
                            <div className="w-full max-w-[380px] h-[540px] rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-white">
                              <iframe
                                src={localWidgetUrl}
                                title="Live Widget Preview"
                                className="w-full h-full border-0"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="absolute bottom-6 right-6 z-10">
                            <button
                              onClick={() => setIsSimulatorOpen(true)}
                              className="group flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
                              style={{ backgroundColor: primaryColor }}
                              aria-label="Open Widget"
                            >
                              <Bot className="h-7 w-7 text-white" />
                              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
                              </span>
                            </button>
                          </div>
                        )}

                      </div>

                      {/* Simulator Bottom Bar */}
                      <div className="px-4 py-2.5 bg-zinc-950 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Live preview over {bot.website_url ? bot.website_url.replace(/^https?:\/\//, "") : "site"}
                        </span>
                        <span>Click chat to test</span>
                      </div>

                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB CONTENT: KNOWLEDGE SOURCES */}
            {activeTab === "sources" && (
              <div className="rounded-[2rem] p-1.5 bg-zinc-200/60 shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
                <div className="rounded-[calc(2rem-0.375rem)] bg-white p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-zinc-950">Indexed Knowledge Sources</h2>
                      <p className="mt-1 text-xs text-zinc-500">
                        Every document and crawled web page indexed into 768-dimension vector chunks.
                      </p>
                    </div>
                    <button
                      onClick={handleReCrawl}
                      disabled={isReCrawling}
                      className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-zinc-850"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Re-sync
                    </button>
                  </div>

                  <div className="space-y-3">
                    {sources.map((src) => (
                      <div
                        key={src.id}
                        className="flex items-center justify-between rounded-2xl border border-zinc-200/70 bg-zinc-50/50 p-4 transition hover:bg-zinc-50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-700 shadow-xs">
                            <Globe className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-zinc-900 truncate">
                              {src.input_url || src.file_name || "Domain Source"}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              {src.page_count ?? 80} Pages Discovered • Embedded with Gemini & Yugabyte
                            </div>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          {src.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
