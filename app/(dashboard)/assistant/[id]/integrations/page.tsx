"use client";

import { AssistantSidebar } from "@/components/create-assistant/assistant-sidebar";
import { Search, ShoppingBag, MessageSquare, Database, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

export default function IntegrationsPage() {
  const params = useParams();
  const assistantId = params?.id as string;
  
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [connectedIds, setConnectedIds] = useState<string[]>(["shopify"]);

  const allIntegrations = [
    {
      id: "shopify",
      name: "Shopify",
      description: "Sync products, inventory, and customer orders directly to your bot.",
      category: "E-commerce",
      icon: ShoppingBag,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      id: "zendesk",
      name: "Zendesk",
      description: "Escalate complex queries to your human support agents seamlessly.",
      category: "Support",
      icon: MessageSquare,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      id: "salesforce",
      name: "Salesforce",
      description: "Connect customer CRM data to personalize chatbot responses.",
      category: "CRM",
      icon: Database,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
  ];

  const categories = ["All", "E-commerce", "Support", "CRM"];

  const filteredIntegrations = allIntegrations.filter(integration => {
    const matchesCategory = activeCategory === "All" || integration.category === activeCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleConnection = (id: string, name: string) => {
    if (connectedIds.includes(id)) {
      setConnectedIds(connectedIds.filter(cid => cid !== id));
      toast.info(`${name} disconnected`);
    } else {
      setConnectedIds([...connectedIds, id]);
      toast.success(`Successfully connected to ${name}!`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_1fr]">
        <AssistantSidebar assistantId={assistantId} />
        <main className="flex min-w-0 flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1160px] flex-1 flex-col">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Integrations</h1>
                <p className="mt-1 text-sm text-slate-500">Connect your data sources, APIs, and third-party services.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search integrations..."
                  className="h-10 w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-64"
                />
              </div>
            </div>

            <div className="mt-8 border-b border-slate-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                      activeCategory === category
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredIntegrations.map((integration) => {
                const Icon = integration.icon;
                const isConnected = connectedIds.includes(integration.id);
                return (
                  <div key={integration.id} className="group relative flex flex-col justify-between rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(15,23,42,0.06)] animate-in fade-in zoom-in-95 duration-300">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${integration.bg} ${integration.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        {isConnected && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-600/20 animate-in fade-in slide-in-from-right-2">
                            <Check className="h-3 w-3" /> Connected
                          </span>
                        )}
                      </div>
                      <div className="mt-5">
                        <h3 className="text-lg font-semibold text-slate-950">{integration.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <button 
                        onClick={() => toggleConnection(integration.id, integration.name)}
                        className={`w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                          isConnected 
                            ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50' 
                            : 'bg-slate-950 text-white hover:bg-slate-800 shadow-sm'
                        }`}
                      >
                        {isConnected ? 'Manage' : 'Connect'}
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {filteredIntegrations.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                    <Search className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900">No integrations found</h3>
                  <p className="mt-1 text-sm text-slate-500">We couldn't find any integrations matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
