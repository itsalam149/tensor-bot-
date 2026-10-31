import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever free",
    desc: "Perfect for testing and small personal websites.",
    features: [
      "1 AI Assistant",
      "Up to 50 indexed pages",
      "500 chat messages / mo",
      "Standard vector search",
      "Community support",
    ],
    cta: "Get started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "per month",
    desc: "For growing businesses and e-commerce stores.",
    features: [
      "5 AI Assistants",
      "Up to 1,000 indexed pages",
      "10,000 chat messages / mo",
      "Live API & database connectors",
      "Custom brand & logo styling",
      "Priority email support",
    ],
    cta: "Get started",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "per month",
    desc: "For high-volume portals and dedicated SLA needs.",
    features: [
      "Unlimited AI Assistants",
      "Unlimited page indexing",
      "100,000 chat messages / mo",
      "Dedicated PGVector instance",
      "Custom SSO & SAML auth",
      "24/7 dedicated support SLA",
    ],
    cta: "Get started",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="relative pt-20 pb-20 lg:pt-28 lg:pb-28">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-[42px] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-[56px]">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-[16px] leading-7 text-slate-600">
            Start free, scale as your business grows. No hidden fees or surprise charges.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col justify-between rounded-[30px] border p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] transition-all hover:shadow-[0_16px_48px_rgba(15,23,42,0.09)] ${
                plan.popular
                  ? "border-indigo-600/90 bg-white ring-2 ring-indigo-600/20"
                  : "border-slate-200/80 bg-white"
              }`}
            >
              {plan.popular ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm">
                  Most popular
                </div>
              ) : null}

              <div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-950">{plan.name}</h3>
                <p className="mt-2 text-xs text-slate-500">{plan.desc}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-slate-950">{plan.price}</span>
                  <span className="text-xs font-medium text-slate-500">/{plan.period}</span>
                </div>

                <div className="mt-8 space-y-3">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href="/sign-up"
                  className={`inline-flex h-11 w-full items-center justify-center rounded-full text-xs font-semibold shadow-sm transition active:scale-[0.98] ${
                    plan.popular
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-slate-950 text-white hover:bg-slate-800"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
