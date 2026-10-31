import { Container } from "@/components/ui/container";
import { Database, Globe, ShoppingBag, Zap, Code2, Server } from "lucide-react";
import type { ComponentType } from "react";

type LucideIcon = ComponentType<{ className?: string }>;

const integrations: { name: string; icon: LucideIcon }[] = [
  { name: "Shopify", icon: ShoppingBag },
  { name: "WooCommerce", icon: Globe },
  { name: "Stripe", icon: Zap },
  { name: "MongoDB", icon: Database },
  { name: "PostgreSQL", icon: Server },
  { name: "REST API", icon: Code2 },
];

export function Integrations() {
  return (
    <section className="relative z-10 py-10">
      <Container>
        <div className="rounded-[28px] border border-slate-200/80 bg-white/60 p-8 shadow-[0_4px_20px_rgba(15,23,42,0.03)] backdrop-blur-md">
          <div className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            Native integrations &amp; live data connectors
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {integrations.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-center gap-2.5 rounded-2xl border border-slate-200/60 bg-white px-4 py-3 text-[14px] font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span>{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}