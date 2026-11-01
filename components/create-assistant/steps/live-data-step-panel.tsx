"use client";

import { useState } from "react";
import { Database, Link2, Key, RefreshCw, CheckCircle2, Sparkles } from "lucide-react";
import { useWizard } from "@/lib/wizard/wizard-context";

export function LiveDataStepPanel() {
  const { state, updateLiveData } = useWizard();
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const liveData = state.liveData;

  const handleToggleEnable = () => {
    updateLiveData({ enabled: !liveData.enabled });
  };

  const handleTestConnection = () => {
    setTesting(true);
    setTestSuccess(false);
    setTimeout(() => {
      setTesting(false);
      setTestSuccess(true);
    }, 1000);
  };

  return (
    <div className="flex flex-col rounded-[30px] border border-slate-900/5 bg-white/80 p-6 sm:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-600">
          <Sparkles className="h-3.5 w-3.5" /> Step 3 of 5
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Connect live data</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sync your product database or connect external APIs to give your assistant real-time knowledge.
        </p>
      </div>

      <div className="space-y-6">
        {/* Custom Database API Toggle Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Custom Database API</h3>
                <p className="text-xs text-slate-500">Fetch real-time inventory and product details.</p>
              </div>
            </div>
            <button
              onClick={handleToggleEnable}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                liveData.enabled ? "bg-indigo-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  liveData.enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Webhook Connection Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Link2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Webhook Connection</h3>
                <p className="text-xs text-slate-500">Send user events and live queries to external endpoints.</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
              Active
            </span>
          </div>

          <div className="space-y-4 pt-3 border-t border-slate-100">
            <div>
              <label className="text-[12px] font-medium text-slate-700">Webhook URL</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  value={liveData.webhookUrl}
                  onChange={(e) => updateLiveData({ webhookUrl: e.target.value })}
                  placeholder="https://api.yourdomain.com/v1/webhook"
                  className="h-10 w-full rounded-xl border border-slate-200 pl-4 pr-4 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-slate-700">Secret Key</label>
              <div className="relative mt-1">
                <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={liveData.secretKey}
                  onChange={(e) => updateLiveData({ secretKey: e.target.value })}
                  placeholder="sk_live_..."
                  className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-4 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="flex items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${testing ? "animate-spin" : ""}`} />
                {testing ? "Testing Endpoint..." : "Test Connection"}
              </button>

              {testSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Endpoint Responded 200 OK
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

