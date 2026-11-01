import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ArrowUpRight, BookOpen, Code, FileText, HelpCircle } from "lucide-react";

const resources = [
  {
    title: "Quickstart Developer Guide",
    desc: "Learn how to embed Tensor-Bot into your React or HTML application in under 5 minutes.",
    category: "Guides",
    icon: BookOpen,
    href: "/docs",
  },
  {
    title: "REST API & Webhooks Reference",
    desc: "Complete endpoint documentation for chatbot creation, source management, and chat stream APIs.",
    category: "API Reference",
    icon: Code,
    href: "/docs",
  },
  {
    title: "PGVector & RAG Architecture",
    desc: "Deep dive into vector embeddings, chunking strategy, and prompt instruction guardrails.",
    category: "Architecture",
    icon: FileText,
    href: "/docs",
  },
  {
    title: "Customer Support Automation FAQ",
    desc: "Best practices for training your assistant on internal help center articles.",
    category: "Best Practices",
    icon: HelpCircle,
    href: "/docs",
  },
];

export default function ResourcesPage() {
  return (
    <div className="relative pt-20 pb-20 lg:pt-28 lg:pb-28">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-[42px] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-[56px]">
            Resources &amp; Guides
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-[16px] leading-7 text-slate-600">
            Everything you need to build, deploy, and scale custom AI assistants.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {resources.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group relative rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-[0_4px_20px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_12px_36px_rgba(15,23,42,0.07)]"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                    {item.category}
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-950" />
                </div>

                <div className="mt-6 flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-slate-600">{item.desc}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
