import { Send, Sparkles, X } from "lucide-react";

export function BrandingPreviewPanel() {
  return (
    <div className="flex flex-col rounded-[30px] border border-slate-200 bg-slate-50 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:p-8 items-center justify-center min-h-[400px]">
      
      {/* Mock Chat Widget */}
      <div className="w-full max-w-[340px] overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] border border-slate-200/60 flex flex-col">
        {/* Header */}
        <div className="bg-indigo-600 px-4 py-4 text-white flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md shadow-sm">
              <span className="text-sm font-bold">A</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold">ACME Support Bot</h3>
              <p className="text-[11px] text-indigo-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <button className="text-indigo-100 hover:text-white transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Chat Body */}
        <div className="bg-slate-50 p-4 h-[240px] flex flex-col gap-4 overflow-y-auto">
          <div className="flex gap-2 items-end">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm mb-1">
              A
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-white border border-slate-200 px-4 py-2.5 text-[13px] text-slate-700 shadow-sm">
              Hi there! 👋 How can I help you today?
            </div>
          </div>

          <div className="flex gap-2 items-end justify-end">
            <div className="rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2.5 text-[13px] text-white shadow-sm">
              Do you offer free shipping?
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm mb-1">
              A
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-white border border-slate-200 px-4 py-2.5 text-[13px] text-slate-700 shadow-sm flex items-center gap-2">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                <span className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></span>
                <span className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></span>
              </span>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="border-t border-slate-200 bg-white p-3">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-4 pr-10 py-2.5 text-[13px] outline-none text-slate-700 focus:border-indigo-500 transition"
            />
            <button className="absolute right-1.5 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-sm">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-2 text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
            Powered by <Sparkles className="h-3 w-3 text-indigo-400" /> Tensor-Bot
          </div>
        </div>
      </div>
    </div>
  );
}
