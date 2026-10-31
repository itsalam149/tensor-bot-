"use client";

import { useState, FormEvent } from "react";
import { Bot, Send, Loader2 } from "lucide-react";
import { useWizard, type BrandState } from "@/lib/wizard/wizard-context";
import { botsApi } from "@/lib/wizard/api-client";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function DeploymentPreview({ brand, botName }: { brand: BrandState; botName: string }) {
  const { state } = useWizard();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: brand.welcomeMessage || `Hi! Ask me anything about ${botName}.` },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userQuery = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userQuery }];
    setMessages(newMessages);
    setIsSending(true);

    if (state.botId) {
      const res = await botsApi.chat(state.botId, userQuery, newMessages.slice(-4));
      setIsSending(false);

      if (res.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: res.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `(Preview mode: ${res.error})` },
        ]);
      }
    } else {
      setIsSending(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Connect your domain in Step 1 to test live RAG answers!",
        },
      ]);
    }
  };

  return (
    <div
      className="overflow-hidden rounded-[24px] border border-slate-200 bg-[#fcfcfd] shadow-sm"
      style={{ fontFamily: brand.font }}
    >
      <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-2.5 bg-white">
        <div className="text-xs font-mono text-slate-500 truncate max-w-[200px]">
          {state.websiteUrl || "https://yourwebsite.com"}
        </div>
        <div className="rounded-full border border-slate-200/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50/50">
          Live Preview
        </div>
      </div>

      <div className="relative min-h-[340px] bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.04),transparent_50%),linear-gradient(180deg,#f9fafb,white)] p-4 flex flex-col justify-end">
        <div className="w-full max-w-[360px] ml-auto overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div
            className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-white shadow-sm"
            style={{ backgroundColor: brand.primaryColor }}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate">{botName}</div>
              <div className="text-[10px] text-white/80 font-normal">Online</div>
            </div>
          </div>

          {/* Messages Body */}
          <div className="p-3 space-y-2.5 max-h-[220px] overflow-y-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "ml-auto text-right text-white shadow-2xs"
                    : "bg-slate-100 text-slate-800"
                }`}
                style={msg.role === "user" ? { backgroundColor: brand.accentColor } : {}}
              >
                {msg.content}
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-1.5 bg-slate-100 text-slate-500 rounded-2xl px-3 py-2 text-xs w-fit">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Searching knowledge base...
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-2 border-t border-slate-100 flex items-center gap-1.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-1.5 text-xs text-slate-800 bg-slate-50 rounded-xl outline-none border border-slate-200 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isSending}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-white transition shadow-sm hover:opacity-90 disabled:opacity-50 shrink-0"
              style={{ backgroundColor: brand.accentColor }}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

