import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Container } from "@/components/ui/container";
import { BookOpen, Code, Terminal, Zap } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="relative min-h-screen bg-[#fbfbfd] text-slate-950">
      <Navbar />

      <section className="pt-20 pb-20 lg:pt-28 lg:pb-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
            {/* Sidebar */}
            <aside className="space-y-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Getting Started</div>
                <div className="mt-3 space-y-1">
                  <a href="#quickstart" className="block rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600">Quickstart</a>
                  <a href="#installation" className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100">Script Embed</a>
                  <a href="#react-sdk" className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100">React Component</a>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">API Reference</div>
                <div className="mt-3 space-y-1">
                  <a href="#api-bots" className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100">GET /api/bots</a>
                  <a href="#api-chat" className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100">POST /api/widget/chat</a>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="space-y-12">
              <div id="quickstart">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  <Zap className="h-3.5 w-3.5" /> Quickstart Guide
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Embed Tensor-Bot into your application
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Tensor-Bot provides lightweight CDN script embeds and React components to deploy trained assistants anywhere.
                </p>
              </div>

              <div id="installation" className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">1. Standard HTML Script Embed</h2>
                <p className="mt-1 text-xs text-slate-500">Paste before the closing &lt;/body&gt; tag on any HTML page.</p>

                <div className="mt-4 rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
                  <code>{`<script src="https://tensorbot.ai/widget.js" data-[#publicid]="your-bot-public-id" defer></script>`}</code>
                </div>
              </div>

              <div id="react-sdk" className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">2. React / Next.js Component</h2>
                <p className="mt-1 text-xs text-slate-500">Use inside client components in modern React setups.</p>

                <div className="mt-4 rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
                  <pre>{`import { TensorBotWidget } from "@tensorbot/react";

export default function App() {
  return <TensorBotWidget publicId="your-bot-public-id" position="bottom-right" />;
}`}</pre>
                </div>
              </div>
            </main>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
