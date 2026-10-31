<div align="center">

<br />

# 🤖 Tensor-Bot

### **AI Chatbot Infrastructure for Business**

Turn your business knowledge into a smart assistant — trained on your website, documents, and live data. Deploy anywhere in minutes.

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Groq](https://img.shields.io/badge/Groq-AI_SDK-F55036?style=for-the-badge)](https://groq.com)

<br />

</div>

---

## ✨ What is Tensor-Bot?

**Tensor-Bot** is a SaaS platform that lets any business create an AI assistant trained on their own content — no machine learning expertise required.

You point it at your website, upload your PDFs, and feed it your FAQs. Tensor-Bot reads it all, chunks it, embeds it into a vector knowledge base, and gives you a production-ready chat widget you can embed anywhere. Your customers get instant, accurate answers grounded in *your* business data, not generic hallucinations.

Think of it as **Chatbase / Dante AI — but built from first principles**, with a clean ingestion-and-retrieval pipeline designed to grow.

---

## 🎯 Core Value Propositions

| Problem | Tensor-Bot Solution |
|---|---|
| Customers ask the same 50 questions repeatedly | Deflect repetitive tickets with an always-on bot |
| Support teams drown in product/policy questions | Train the bot on every document you have |
| Visitors leave before finding the right product | Guide shoppers with real-time, data-aware recommendations |
| Internal knowledge is siloed across docs & wikis | Make company knowledge instantly searchable for teams |

---

## 🚀 Features

### 🧠 Knowledge Ingestion Pipeline

- **Website Crawler** — Scrapes any URL using Cheerio + Turndown, converting HTML to clean Markdown. Strips scripts, styles, navbars, and boilerplate automatically.
- **File Uploads** — Supports PDF, DOCX, and TXT files with text extraction and normalization.
- **Live Data Connections** — Connect to APIs, inventory systems, or databases for real-time answers. *(roadmap)*
- **Smart Chunking** — Content is split into semantically coherent chunks (~800–1200 tokens) with overlap, preserving headings and paragraph boundaries.
- **Vector Embeddings** — Every chunk is embedded and stored for fast semantic retrieval at query time.

### 💬 Chat & Retrieval (RAG)

- **Retrieval-Augmented Generation** — At query time, the user's question is embedded, matched against the top-K relevant chunks, and passed to an LLM with full source context.
- **Playground Chat** — Test your bot's quality before deployment. Inspect which chunks were retrieved and why.
- **Embeddable Widget** — Drop the bot onto any website with a single script tag. Public access via signed token — no private data exposed.
- **Source Citations** — Answers include references to the exact documents used.

### 📊 Dashboard & Management

- **Multi-bot Workspace** — Create and manage multiple assistants from a single dashboard.
- **5-Step Assistant Builder** — Guided setup flow: Website → Sources → Live Data → Branding → Deploy.
- **Source Status Tracking** — Every source has a visible lifecycle: `pending → crawling → extracting → chunking → embedding → completed`.
- **Analytics** — Track queries per day, source coverage, answer quality, and retrieval latency.
- **Settings & API Keys** — Manage workspace identity, appearance, team access, billing, and API keys.

### 🔐 Auth & Security

- **Supabase Auth** — Email/password sign-up, magic links, email verification, password reset — all wired up.
- **SSRF Protection** — Crawl jobs validate URLs and block private IP ranges.
- **Rate Limiting** — Public widget endpoints are rate-limited to prevent abuse.
- **Secure File Handling** — File types and sizes are validated before processing.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Tensor-Bot                               │
│                                                                 │
│  ┌─────────────────┐         ┌──────────────────────────────┐  │
│  │  Marketing Site  │         │        Dashboard App         │  │
│  │  (app/marketing) │         │      (app/dashboard)         │  │
│  │                 │         │                              │  │
│  │  • Hero         │         │  • /dashboard  (bot list)    │  │
│  │  • How it Works │         │  • /create     (5-step flow) │  │
│  │  • Use Cases    │         │  • /assistant/[id]/settings  │  │
│  │  • Integrations │         │  • /assistant/[id]/analytics │  │
│  │  • Pricing      │         │  • /integrations             │  │
│  └─────────────────┘         └──────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Routes (Next.js)                   │  │
│  │                                                          │  │
│  │  POST /api/test-crawl   →  Crawl any URL on demand      │  │
│  │  GET  /auth/callback    →  Supabase OAuth callback       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Services Layer                           │  │
│  │                                                          │  │
│  │  services/crawler/                                       │  │
│  │    ├── local.ts       (Cheerio + Turndown HTML→Markdown) │  │
│  │    ├── transformer.ts (CrawledPage → SourceDocument)     │  │
│  │    └── types.ts       (CrawledPage, SourceDocument, etc) │  │
│  │                                                          │  │
│  │  services/utils/                                         │  │
│  │    └── crawler.ts     (URL normalization, Firecrawl map) │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Ingestion Pipeline (per source)

```
URL / File Uploaded
      │
      ▼
 [1] Validate & Normalize
      │
      ▼
 [2] Crawl / Extract Text
      │  (Cheerio for HTML, parsers for PDF/DOCX)
      ▼
 [3] Normalize & Clean Content
      │  (strip boilerplate, collapse whitespace)
      ▼
 [4] Chunk Content
      │  (~1000 tokens, ~150 token overlap)
      ▼
 [5] Generate Embeddings
      │  (AI SDK + Groq / OpenAI)
      ▼
 [6] Store Vectors + Metadata
      │  (Postgres + pgvector)
      ▼
 Source → status: "completed" ✅
```

### RAG Query Flow

```
User types question
      │
      ▼
 Embed the query  ──────────────────────────────────────┐
      │                                                 │
      ▼                                                 │
 Vector similarity search (top-K chunks)                │
      │                                                 │
      ▼                                                 │
 Build prompt: [System instructions] +                  │
               [Retrieved chunks as context] +          │
               [User question]                          │
      │                                                 │
      ▼                                                 │
 LLM (Groq / compatible) generates answer ◄────────────┘
      │
      ▼
 Stream response + source citations to UI
```

---

## 📁 Project Structure

```
tensor-bot/
│
├── app/
│   ├── (marketing)/          # Public-facing landing pages
│   │   ├── page.tsx          # Home page
│   │   ├── pricing/          # Pricing page
│   │   ├── platform/         # Platform overview
│   │   ├── use-cases/        # Use cases page
│   │   └── resources/        # Resources page
│   │
│   ├── (dashboard)/          # Authenticated app shell
│   │   ├── dashboard/        # Bot list & overview
│   │   ├── create/           # New assistant wizard (5 steps)
│   │   ├── integrations/     # Connected data sources
│   │   ├── analytics/        # Global analytics
│   │   ├── settings/         # Workspace settings
│   │   └── assistant/[id]/   # Per-assistant pages
│   │       ├── settings/     # Bot config, API keys
│   │       ├── integrations/ # Bot-level connections
│   │       └── analytics/    # Bot-level metrics
│   │
│   ├── (auth)/               # Auth flow pages
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── verify-email/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   ├── api/
│   │   └── test-crawl/       # POST — crawl URL & preview extraction
│   │
│   └── auth/callback/        # Supabase OAuth callback handler
│
├── components/
│   ├── site/                 # Marketing site components
│   │   ├── hero/             # Hero section (content, chat preview, floating icons)
│   │   ├── how-it-works.tsx  # Dashboard UI mock + steps
│   │   ├── use-cases.tsx     # E-comm / Support / Internal / Sales cards
│   │   ├── integrations.tsx  # Integration logo cloud
│   │   ├── cta-section.tsx   # Call-to-action section
│   │   ├── logo-cloud.tsx    # Trust logos
│   │   ├── navbar.tsx        # Site navigation
│   │   └── footer.tsx        # Site footer
│   │
│   ├── create-assistant/     # 5-step assistant creation flow
│   │   ├── assistant-stepper.tsx   # Step progress indicator
│   │   ├── assistant-sidebar.tsx   # Dashboard nav sidebar
│   │   ├── assistant-header.tsx    # Top bar with stepper
│   │   ├── assistant-footer-bar.tsx # Back/Next navigation
│   │   └── shared/
│   │       ├── source-card.tsx          # Individual source item card
│   │       └── deployment-preview.tsx   # Embed code preview
│   │
│   ├── auth/                 # Auth layout components
│   │   ├── auth-shell.tsx
│   │   └── auth-brand-panel.tsx
│   │
│   └── ui/                   # Shared primitives
│       ├── button.tsx
│       ├── container.tsx
│       ├── glass-card.tsx
│       ├── section-label.tsx
│       └── floating-icon.tsx
│
├── services/                 # Business logic & integrations
│   ├── crawler/
│   │   ├── index.ts          # Public API exports
│   │   ├── local.ts          # Cheerio/Turndown web crawler
│   │   ├── transformer.ts    # CrawledPage → SourceDocument
│   │   └── types.ts          # Shared TypeScript interfaces
│   └── utils/
│       └── crawler.ts        # URL normalization, Firecrawl adapter
│
├── docs/
│   └── backend.prd.md        # Full backend product requirements doc
│
└── .env.local                # Supabase + AI API keys
```

---

## 🧩 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework |
| **Language** | TypeScript 5 | Type-safe codebase |
| **Styling** | Tailwind CSS 4 | Utility-first styling |
| **Auth** | Supabase Auth + SSR | Email auth, sessions, OAuth |
| **Database** | YugabyteDB or Supabase (Postgres) | Bot/source/chunk/user records |
| **Vector Search** | pgvector *(planned)* | Semantic chunk retrieval |
| **AI / LLM** | Groq via AI SDK | Fast inference for chat |
| **Web Crawler** | Cheerio + Turndown | Same-origin sitemap, page, and linked PDF discovery |
| **File Parsing** | pdf-parse + mammoth | PDF / DOCX / TXT text extraction |
| **Shared context** | Meko MCP | Recall and store agent context per datapack |
| **UI Icons** | Lucide React | Consistent icon set |
| **Toast / Notifs** | Sonner | In-app notifications |

---

## 🔑 Environment Variables

Create a `.env.local` file at the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# YugabyteDB knowledge store (direct PostgreSQL connection)
YUGABYTE_DATABASE_URL=postgresql://user:password@host:5433/database
YUGABYTE_SSL=true

# Meko shared context layer (server-only)
MEKO_MCP_URL=https://mcp.mekodata.ai/mcp
MEKO_API_KEY=mko_tkn_your_key
MEKO_DATAPACK=tensor-bot-knowledge
# Override only when your Meko tool names differ.
MEKO_RECALL_TOOL=recall
MEKO_WRITE_TOOL=write

# AI (Groq)
GROQ_API_KEY=your_groq_api_key
```

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project, or a Supabase-compatible YugabyteDB gateway
- A [Groq](https://groq.com) API key (or compatible AI provider)
- A Meko datapack and MCP key for shared agent context

### Installation

```bash
# Clone the repo
git clone https://github.com/your-org/tensor-bot.git
cd tensor-bot

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# → fill in your Supabase and Groq credentials

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the marketing site.

Navigate to [http://localhost:3000/sign-up](http://localhost:3000/sign-up) to create an account and access the dashboard.

### Test the Crawler

You can test the web crawling pipeline directly via the API:

```bash
curl -X POST http://localhost:3000/api/test-crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Response:**
```json
{
  "success": true,
  "pageCount": 1,
  "samplePage": {
    "url": "https://example.com",
    "title": "Example Domain",
    "markdown": "# Example Domain\n\nThis domain is for use in illustrative examples..."
  },
  "sampleDocument": {
    "sourceId": "test-source-id",
    "botId": "test-bot-id",
    "title": "Example Domain",
    "content": "...",
    "metadata": { "url": "...", "sourceType": "website", "crawledAt": "..." }
  }
}
```

---

## 🗺️ Roadmap

### ✅ Phase 1 — Foundation *(current)*
- [x] Marketing site with hero, features, use cases, integrations
- [x] Auth system (sign-up, sign-in, email verify, password reset)
- [x] Dashboard UI (bot list, assistant creation wizard)
- [x] Local web crawler (Cheerio + Turndown, URL validation)
- [x] Crawler service layer with type-safe interfaces
- [x] Per-assistant settings, analytics, and integrations pages
- [x] API route for testing crawl pipeline

### 🔄 Phase 2 — Core Backend
- [ ] Supabase database schema (bots, sources, chunks, embeddings)
- [ ] Background job worker for async ingestion
- [ ] PDF & DOCX file parser
- [ ] Multi-page website crawling (depth-limited, same-domain)
- [ ] Chunking pipeline (heading/paragraph/sentence split)
- [ ] Embedding generation + pgvector storage
- [ ] Playground chat API (RAG with Groq)
- [ ] Source status polling & progress UI

### 🚀 Phase 3 — Production Features
- [ ] Embeddable chat widget (CDN-hosted `<script>` tag)
- [ ] Widget public API (signed token, rate limiting, session tracking)
- [ ] Source re-sync / reprocess
- [ ] Analytics dashboard (query count, latency, top questions)
- [ ] Pricing plans + usage enforcement

### 🌐 Phase 4 — Integrations
- [ ] Shopify product catalog sync
- [ ] Notion / Google Drive document import
- [ ] REST API data connector (bring your own live data)
- [ ] Slack / Teams bot deployment
- [ ] Webhook support for source auto-sync

---

## 📐 Data Model

```
Bot
 ├── id, owner_id, name, description
 ├── public_identifier (for widget auth)
 └── status, created_at, updated_at

Source (belongs to Bot)
 ├── type: "website" | "file"
 ├── status: pending → crawling → extracting → chunking → embedding → completed
 ├── input_url | file_url, file_name, file_type
 └── error_message, processed_at

Document (one per crawled page or file)
 ├── source_id, bot_id
 ├── title, content (normalized text)
 └── metadata_json, origin_url

Chunk (derived from Document)
 ├── document_id, source_id, bot_id
 ├── chunk_index, content (~1000 tokens)
 └── embedding_status, metadata_json

Embedding (one per Chunk)
 ├── chunk_id, model_name
 └── vector (stored in pgvector)

ChatSession
 └── bot_id, visitor_session_id, source (playground | widget)

ChatMessage
 ├── session_id, role (user | assistant)
 ├── content, sources_used_json
 └── latency_ms
```

---

## 🌍 Use Cases

<table>
<tr>
<td width="50%">

**🛍️ E-commerce**

Help shoppers find the right product, check stock availability, compare options, and complete purchases — without waiting for a human agent.

</td>
<td width="50%">

**🎧 Customer Support**

Resolve repetitive questions about shipping, returns, policies, and account issues instantly. Only escalate what truly needs a human.

</td>
</tr>
<tr>
<td width="50%">

**🔍 Internal Knowledge Base**

Make your company wiki, HR policies, onboarding docs, and runbooks instantly searchable for employees — no more digging through Notion.

</td>
<td width="50%">

**📈 Sales & Conversion**

Guide website visitors from discovery to decision. Recommend products, answer objections, and capture leads — all in the chat widget.

</td>
</tr>
</table>

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

Please read the backend PRD at [`docs/backend.prd.md`](./docs/backend.prd.md) before working on ingestion or retrieval features — it captures all the design decisions.

---

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">

Built with ❤️ using Next.js, Supabase, Groq, and Tailwind CSS.

**[Live Demo](https://tensor-bot.vercel.app)** · **[Documentation](./docs/backend.prd.md)** · **[Report Bug](https://github.com/your-org/tensor-bot/issues)**

</div>
