"use client";

import { useEffect, useState, useRef, use } from "react";
import Image from "next/image";
import { Send, Bot, User, Sparkles, Loader2, RotateCcw, ExternalLink } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type BotMeta = {
  id?: string;
  name: string;
  website_url?: string;
  branding?: {
    primaryColor?: string;
    accentColor?: string;
    welcomeMessage?: string;
    font?: string;
    tone?: string;
  };
};

const DEFAULT_STARTERS = [
  "What platters do you offer?",
  "What are your hours & location?",
  "Tell me about your chicken curries",
  "Do you have vegetarian options?",
];

export default function WidgetPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  const [bot, setBot] = useState<BotMeta>({ name: "AI Assistant" });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadBot() {
      try {
        const res = await fetch(`/api/widget/${publicId}`);
        const data = await res.json();
        if (data.success && data.bot) {
          setBot(data.bot);
          const welcome = data.bot.branding?.welcomeMessage || "Hi! 👋 How can I help you today?";
          setMessages([{ id: "welcome", role: "assistant", content: welcome }]);
        }
      } catch (err) {
        console.warn("Failed to load widget metadata:", err);
      } finally {
        setFetchingMeta(false);
      }
    }
    loadBot();
  }, [publicId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (userTextToSend?: string) => {
    const text = (userTextToSend ?? input).trim();
    if (!text || loading) return;

    setInput("");
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`/api/widget/${publicId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I ran into an issue finding that answer. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = bot.branding?.primaryColor || "#DC2626";
  const accentColor = bot.branding?.accentColor || "#F59E0B";
  const font = bot.branding?.font || "Poppins, sans-serif";

  return (
    <div
      className="flex h-screen w-full flex-col bg-zinc-50 text-zinc-900 antialiased"
      style={{ fontFamily: font }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 py-3.5 text-white shadow-md transition-colors"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-xs">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold tracking-tight truncate leading-tight">{bot.name}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/85 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span>Online • YugabyteDB RAG</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {bot.website_url && (
            <a
              href={bot.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white transition"
              title="Visit Website"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <button
            onClick={() => {
              const welcome = bot.branding?.welcomeMessage || "Hi! 👋 How can I help you today?";
              setMessages([{ id: "welcome", role: "assistant", content: welcome }]);
            }}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white transition"
            title="Reset conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zinc-50/60">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-semibold shadow-xs ${
                m.role === "user"
                  ? "text-white"
                  : "bg-white border border-zinc-200/90 text-zinc-700"
              }`}
              style={m.role === "user" ? { backgroundColor: accentColor } : {}}
            >
              {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>

            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                m.role === "user"
                  ? "text-white rounded-tr-xs"
                  : "bg-white border border-zinc-200/80 text-zinc-800 rounded-tl-xs whitespace-pre-wrap"
              }`}
              style={m.role === "user" ? { backgroundColor: accentColor } : {}}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 pl-9 pt-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-800" />
            <span className="font-medium">Searching knowledge & formulating answer...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Starter Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-zinc-100 bg-white flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider shrink-0">Ask:</span>
          {DEFAULT_STARTERS.map((starter) => (
            <button
              key={starter}
              onClick={() => handleSend(starter)}
              disabled={loading}
              className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 transition disabled:opacity-50"
            >
              {starter}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="border-t border-zinc-200/80 bg-white p-3 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask ${bot.name}...`}
          disabled={loading}
          className="flex-1 h-10 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:bg-white focus:ring-2 focus:ring-zinc-200/80"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm hover:bg-zinc-800 disabled:opacity-40 transition shrink-0 active:scale-95"
          style={input.trim() ? { backgroundColor: primaryColor } : {}}
        >
          <Send className="h-4 w-4 text-white" />
        </button>
      </form>

      {/* Footer Branding */}
      <div className="bg-white py-2 text-center text-[10px] text-zinc-400 border-t border-zinc-100 flex items-center justify-center gap-1.5 font-medium">
        <Image src="/logo.png" alt="Tensor-Bot Logo" width={13} height={13} className="object-contain filter drop-shadow-xs" />
        <span>Powered by <strong className="text-zinc-600 font-semibold">Tensor-Bot</strong> • YugabyteDB Cloud</span>
      </div>
    </div>
  );
}
