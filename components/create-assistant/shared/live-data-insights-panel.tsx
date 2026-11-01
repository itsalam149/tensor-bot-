import { Terminal, Activity, CheckCircle2 } from "lucide-react";

export function LiveDataInsightsPanel() {
  return (
    <div className="flex flex-col rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:p-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Data Sync Status</h3>
            <p className="text-xs text-slate-500">Real-time connection logs</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-600/20">
          <CheckCircle2 className="h-3 w-3" /> Listening
        </span>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-slate-950">
        <div className="flex items-center justify-between bg-slate-900 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <Terminal className="h-3 w-3" /> webhook_listener.sh
          </div>
        </div>
        
        <div className="p-4 font-mono text-[13px] leading-6 text-slate-300">
          <div className="flex gap-4">
            <span className="text-slate-500">10:42:01</span>
            <span className="text-indigo-400">[info]</span>
            <span>Initializing webhook listener on port 8080...</span>
          </div>
          <div className="flex gap-4">
            <span className="text-slate-500">10:42:02</span>
            <span className="text-emerald-400">[success]</span>
            <span>Successfully connected to https://api.acme.com/v1</span>
          </div>
          <div className="flex gap-4">
            <span className="text-slate-500">10:42:05</span>
            <span className="text-blue-400">[post]</span>
            <span>Received test payload via /webhook</span>
          </div>
          <div className="flex gap-4">
            <span className="text-slate-500">10:42:05</span>
            <span className="text-indigo-400">[info]</span>
            <span>Validating payload signature...</span>
          </div>
          <div className="flex gap-4">
            <span className="text-slate-500">10:42:06</span>
            <span className="text-emerald-400">[success]</span>
            <span>Signature valid. 200 OK sent.</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500"></span>
            <span className="text-slate-500">Awaiting events...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
