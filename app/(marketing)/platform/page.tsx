import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ArrowRight, Cpu, Database, Globe, Layers, ShieldCheck, Zap } from "lucide-react";

export default function PlatformPage() {
  return (
    <div className="relative pt-20 pb-20 lg:pt-28 lg:pb-28">
      <Container>
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-[42px] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-[56px]">
            Enterprise AI Chatbot Platform Architecture
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-7 text-slate-600">
            A complete pipeline for knowledge ingestion, vector embedding, and sub-50ms context retrieval.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-[0_4px_20px_rgba(15,23,42,0.03)] lg:col-span-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Globe className="h-5 w-5" />
            </div>
            <h2 className="mt-6 text-[22px] font-semibold tracking-[-0.03em] text-slate-950">
              Multi-source Knowledge Crawler
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-slate-600">
              Extract markdown and structured data from sitemaps, single pages, uploaded PDFs, CSV catalogs, and custom Q&amp;A pairs in real time.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-white p-8 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Database className="h-5 w-5" />
            </div>
            <h2 className="mt-6 text-[22px] font-semibold tracking-[-0.03em] text-slate-950">
              PGVector Indexing
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-slate-600">
              Gemini text-embedding-004 vectors with HNSW cosine similarity indices for lightning-fast matching.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Cpu className="h-5 w-5" />
            </div>
            <h2 className="mt-6 text-[22px] font-semibold tracking-[-0.03em] text-slate-950">
              Contextual RAG Engine
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-slate-600">
              Strict system prompt instructions eliminate hallucinations and restrict answers strictly to verified context.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-[0_4px_20px_rgba(15,23,42,0.03)] lg:col-span-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="mt-6 text-[22px] font-semibold tracking-[-0.03em] text-slate-950">
              Row Level Security &amp; Data Privacy
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-slate-600">
              Isolated user workspaces powered by Supabase RLS ensure knowledge bases are strictly partitioned by tenant.
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/sign-up"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-slate-950 px-7 text-[14px] font-semibold text-white shadow-lg transition hover:bg-slate-800"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
