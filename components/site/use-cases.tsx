import { Container } from "@/components/ui/container";
import { BarChart3, Headphones, ShoppingBag, UserRoundSearch } from "lucide-react";

const useCases = [
  {
    title: "E-commerce & Retail",
    desc: "Guide shoppers to products, answer stock questions, and boost online conversion rates.",
    icon: ShoppingBag,
  },
  {
    title: "Customer Support",
    desc: "Automate repetitive tickets and provide 24/7 instant answers with human handoff readiness.",
    icon: Headphones,
  },
  {
    title: "Internal Documentation",
    desc: "Empower your team to instant search company policies, SOPs, and technical knowledge.",
    icon: UserRoundSearch,
  },
  {
    title: "SaaS & Lead Generation",
    desc: "Engage website visitors, qualify prospective leads, and guide users through onboarding.",
    icon: BarChart3,
  },
];

export function UseCases() {
  return (
    <section className="relative z-10 py-16 lg:py-24">
      <Container>
        <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h2 className="max-w-[500px] text-[36px] font-semibold leading-[1.05] tracking-[-0.05em] text-slate-950 sm:text-[46px]">
              Built for real business impact.
            </h2>
          </div>
          <p className="max-w-[380px] text-[15px] leading-7 text-slate-600">
            From e-commerce discovery to automated helpdesks, Tensor-Bot delivers measurable efficiency.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {useCases.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_14px_36px_rgba(15,23,42,0.08)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-[18px] font-semibold tracking-[-0.03em] text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-2 text-[14px] leading-6 text-slate-600">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
