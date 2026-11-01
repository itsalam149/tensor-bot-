import { Rocket, Code, TerminalSquare, ExternalLink } from "lucide-react";

export function DeployStepPanel({ onDeploy }: { onDeploy?: () => void }) {
  return (
    <div className="flex flex-col rounded-[30px] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Step 5 of 5</h2>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Deploy your assistant</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your assistant is fully trained and customized. Choose how you want to integrate it into your product.
        </p>
      </div>

      <div className="space-y-6">
        <div className="group relative flex cursor-pointer rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Code className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Embed on Website</h3>
              <p className="mt-1 text-xs text-slate-600">
                Copy and paste a simple JavaScript snippet into your website's `{"<head>"}` to add the chat widget.
              </p>
              
              <div className="mt-4 overflow-hidden rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between bg-slate-900 px-4 py-2 border-b border-slate-800">
                  <span className="text-[11px] font-medium text-slate-400">index.html</span>
                  <button className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition">Copy code</button>
                </div>
                <div className="p-4 overflow-x-auto text-left">
                  <code className="text-[12px] leading-5 text-slate-300 font-mono whitespace-pre">
                    <span className="text-slate-500">{"<!-- Tensor-Bot Widget -->"}</span>{"\n"}
                    <span className="text-pink-400">{"<script"}</span>
                    <span className="text-amber-300"> src=</span>
                    <span className="text-emerald-300">"https://cdn.tensor-bot.com/widget.js"</span>{"\n"}
                    <span className="text-amber-300"> data-bot-id=</span>
                    <span className="text-emerald-300">"bot_8f92j1k4l5"</span>
                    <span className="text-pink-400">{"></script>"}</span>
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="group relative flex cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:bg-slate-50">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-white group-hover:shadow-sm">
              <TerminalSquare className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Use API Endpoint</h3>
              <p className="mt-1 text-xs text-slate-500">
                Build your own custom UI and communicate with your assistant via our REST API.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700">
                  View API Documentation <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button onClick={onDeploy} className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:-translate-y-0.5">
            <Rocket className="h-5 w-5" />
            Deploy Assistant
          </button>
          <p className="mt-3 text-center text-xs text-slate-500">
            You can always change these settings later from the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
