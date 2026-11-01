import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ArrowRight, Bot, Cpu, Database, Globe, Layers, Sparkles, Zap } from "lucide-react";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative z-10 py-20 lg:py-28">
      <Container>
        <div className="mb-14 max-w-2xl">
          <h2 className="text-[36px] font-semibold leading-[1.05] tracking-[-0.05em] text-slate-950 sm:text-[46px]">
            Engineered for precision and enterprise scale.
          </h2>
          <p className="mt-4 text-[16px] leading-7 text-slate-600">
            From automated crawling to real-time vector retrieval, Tensor-Bot powers reliable AI conversations.
          </p>
        </div>

        {/* Bento grid - 4 items -> 4 cells */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Cell 1: Ingestion (Span 2 on lg) */}
          <div className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-[0_4px_20px_rgba(15,23,42,0.03)] transition-all hover:border-slate-300 hover:shadow-[0_12px_36px_rgba(15,23,42,0.07)] lg:col-span-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.03em] text-slate-950">
              Automated Site &amp; Document Ingestion
            </h3>
            <p className="mt-2 max-w-lg text-[14px] leading-6 text-slate-600">
              Crawl sitemaps, parse PDFs, and index FAQs automatically. Keep your assistant updated without manual effort.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-slate-700">Web Crawling</span>
              <span className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-slate-700">PDF &amp; Docs</span>
              <span className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-slate-700">Auto Sync</span>
            </div>
          </div>

          {/* Cell 2: Vector DB */}
          <div className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-b from-indigo-50/50 to-white p-7 shadow-[0_4px_20px_rgba(15,23,42,0.03)] transition-all hover:border-slate-300 hover:shadow-[0_12px_36px_rgba(15,23,42,0.07)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.03em] text-slate-950">
              Vector Semantic Indexing
            </h3>
            <p className="mt-2 text-[14px] leading-6 text-slate-600">
              Chunk and embed knowledge into PGVector for sub-50ms context retrieval on every query.
            </p>
          </div>

          {/* Cell 3: Live APIs */}
          <div className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-[0_4px_20px_rgba(15,23,42,0.03)] transition-all hover:border-slate-300 hover:shadow-[0_12px_36px_rgba(15,23,42,0.07)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.03em] text-slate-950">
              Live Data &amp; Tools
            </h3>
            <p className="mt-2 text-[14px] leading-6 text-slate-600">
              Connect external APIs, inventory databases, or order systems to answer dynamic live requests.
            </p>
          </div>

          {/* Cell 4: Deployment (Span 2 on lg) */}
          <div className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-[0_4px_20px_rgba(15,23,42,0.03)] transition-all hover:border-slate-300 hover:shadow-[0_12px_36px_rgba(15,23,42,0.07)] lg:col-span-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Bot className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.03em] text-slate-950">
              Instant Embed &amp; Customizable Widget
            </h3>
            <p className="mt-2 max-w-lg text-[14px] leading-6 text-slate-600">
              Copy a single script tag or React snippet. Match your site brand with custom colors, avatar, and tone of voice.
            </p>

            <div className="mt-6">
              <Link
                href="/platform"
                className="inline-flex items-center gap-2 text-[14px] font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                Explore platform architecture
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}