"use client";

import { AssistantSidebar } from "@/components/create-assistant/assistant-sidebar";
import { Copy, Eye, EyeOff, Upload, Palette, User, Shield, CreditCard, Key } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

export default function SettingsPage() {
  const params = useParams();
  const assistantId = params?.id as string;
  
  const [activeTab, setActiveTab] = useState("general");
  const [showKey, setShowKey] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'team', label: 'Team & Access', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'api', label: 'API Keys', icon: Key },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText("sk_live_1234567890abcdef");
    toast.success("API Key copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_1fr]">
        <AssistantSidebar assistantId={assistantId} />
        <main className="flex min-w-0 flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1160px] flex-1 flex-col">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Settings</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your workspace preferences, billing, and account details.</p>
            
            <div className="mt-8 flex flex-1 flex-col lg:flex-row gap-8">
              {/* Settings Nav */}
              <nav className="w-full lg:w-64 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-white text-indigo-600 shadow-[0_4px_20px_rgba(15,23,42,0.03)] border border-slate-200/80' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* Settings Content */}
              <div className="flex-1 space-y-8">
                {activeTab === 'general' && (
                  <section className="rounded-[30px] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-slate-950">Workspace Identity</h2>
                      <p className="mt-1 text-sm text-slate-500">Update your company name and logo.</p>
                    </div>
                    
                    <div className="space-y-6 max-w-xl">
                      <div className="flex items-center gap-6">
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50">
                          <Upload className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                          <button onClick={() => toast.info('File picker opened')} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                            Upload logo
                          </button>
                          <p className="mt-2 text-[13px] text-slate-500">Recommended size: 256x256px.</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-900">Workspace Name</label>
                        <input 
                          type="text" 
                          defaultValue="ACME Corporation"
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 border-t border-slate-100 pt-6 flex justify-end">
                      <button onClick={() => toast.success('Settings saved successfully')} className="rounded-xl bg-slate-950 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
                        Save changes
                      </button>
                    </div>
                  </section>
                )}

                {activeTab === 'api' && (
                  <section className="rounded-[30px] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-slate-950">API Keys</h2>
                      <p className="mt-1 text-sm text-slate-500">Use these keys to authenticate requests from your backend.</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-slate-900">Production Key</div>
                          <div className="text-[12px] text-slate-500">Created Oct 12, 2023</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 overflow-hidden rounded-xl bg-slate-50 px-3 py-2 font-mono text-sm text-slate-600">
                            {showKey ? "sk_live_1234567890abcdef" : "sk_live_••••••••••••••••••••••••••••"}
                          </div>
                          <button onClick={() => setShowKey(!showKey)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900">
                            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button onClick={handleCopy} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900">
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {['appearance', 'team', 'billing'].includes(activeTab) && (
                  <section className="flex flex-col items-center justify-center rounded-[30px] border border-slate-200 border-dashed bg-slate-50/50 p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      {tabs.find(t => t.id === activeTab)?.icon({ className: "h-5 w-5" })}
                    </div>
                    <h3 className="mt-4 text-sm font-medium text-slate-900">{tabs.find(t => t.id === activeTab)?.label} Settings</h3>
                    <p className="mt-1 text-sm text-slate-500">This section is coming soon.</p>
                  </section>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
