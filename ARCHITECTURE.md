# Tensor-Bot Architecture & Engineering Guide

This document outlines the end-to-end architecture, data pipelines, retrieval mechanisms, and deployment workflows powering **Tensor-Bot** — an autonomous, enterprise-grade AI Chatbot and Knowledge Base platform.

---

## 1. High-Level Architecture Overview

```
                      +------------------------------------------+
                      |         Target Website / Domain          |
                      |        (e.g., knightscurryexpress.com)   |
                      +--------------------+---------------------+
                                           |
                                  [ 1. Discovery ]
                                           v
                   +-----------------------------------------------+
                   |         Firecrawl Engine & Brand Extractor    |
                   |   - /v1/map: Discovers all sitemap & subpaths |
                   |   - /v1/scrape: Extracts high-fidelity MD     |
                   |   - Brand Extractor: Primary/Accent/Fonts     |
                   +-----------------------+-----------------------+
                                           |
                                [ 2. Text Pipeline ]
                                           v
                   +-----------------------------------------------+
                   |        Chunking, Normalization & Cleaning     |
                   |   - Semantic paragraph chunking (800-1200 ch) |
                   |   - 150-char sliding overlap                  |
                   |   - SHA-256 hash deduplication                |
                   +-----------------------+-----------------------+
                                           |
                                  [ 3. Dual Storage ]
                                           v
        +----------------------------------+----------------------------------+
        |                                                                     |
        v                                                                     v
+-------------------------------+                             +-------------------------------+
|     YugabyteDB Cloud (SQL)    |                             |        Meko MCP (Memory)      |
|  - pgvector 768-dim embeddings|                             |  - Model Context Protocol     |
|  - HNSW Cosine Similarity     |                             |  - Cross-session memory       |
|  - Chunks, Bots, Sources, Logs|                             |  - context_search / memory_add|
+---------------+---------------+                             +---------------+---------------+
                |                                                             |
                +------------------------------+------------------------------+
                                               |
                                     [ 4. Query & Recall ]
                                               v
                             +-----------------------------------+
                             |     Contextual Dual-Brain RAG     |
                             |   - Gemini 2.5/3.8 Flash Engine   |
                             |   - Fallback Semantic Synthesizer |
                             +-----------------+-----------------+
                                               |
                                     [ 5. Deployment ]
                                               v
                    +------------------------------------------+
                    |        Client Website Embed & Widget     |
                    |   - <script src=".../widget.js">         |
                    |   - Isolated iframe & floating launcher  |
                    |   - Full custom brand theme              |
                    +------------------------------------------+
```

---

## 2. Project Directory Structure

```
tensor-bot/
├── app/
│   ├── (auth)/                  # Sign-in, sign-up, auth flows
│   ├── (dashboard)/
│   │   ├── assistant/[id]/      # Live assistant management, analytics, test sandbox
│   │   ├── create/              # 5-step interactive wizard (Website, Sources, Live Data, Branding, Deploy)
│   │   ├── assistants/          # Assistant catalog & management
│   ├── (marketing)/             # High-converting landing & platform feature pages
│   ├── api/
│   │   ├── bots/                # Bot creation, CRUD, and configuration endpoints
│   │   ├── bots/[id]/chat/      # Internal playground RAG chat route
│   │   ├── widget/[publicId]/   # Public-facing widget endpoints & embed chat route
│   └── widget/[publicId]/       # Standalone iframe widget UI
├── components/
│   ├── assistant/               # Assistant dashboard components (tabs, sandbox, config)
│   ├── create/                  # Step-by-step wizard forms (URL input, crawler preview, color picker)
│   ├── marketing/               # Landing page hero, bento grid, testimonials, pricing
│   └── ui/                      # Reusable design tokens (buttons, badges, inputs, dialogs)
├── services/
│   ├── crawler/                 # Firecrawl API integration, local Cheerio fallback, brand color extractor
│   ├── ingestions/              # Paragraph chunker, normalizer, pipeline orchestrator
│   ├── gemini/                  # Google GenAI LLM generation & text-embedding providers
│   ├── meko/                    # Meko MCP client (JSON-RPC 2.0 client for persistent memory)
│   ├── parser/                  # PDF, DOCX, TXT document parsers
│   └── yugabyte/                # YugabyteDB connection pool, SQL schema, pgvector similarity search
├── public/
│   ├── widget.js                # Zero-dependency vanilla JS embed loader script
│   ├── logo.png                 # Crisp transparent robot mascot logo mark
│   └── full-logo.png            # Full brand identity logo with typography
└── db/
    └── yugabyte.sql             # PostgreSQL DDL migrations with vector extensions & HNSW indices
```

---

## 3. Deep Dive: How Firecrawl Works in Tensor-Bot

### Discovery & Scraping Pipeline (`services/crawler/firecrawl.ts`)
When a user enters a business domain (e.g. `https://knightscurryexpress.com`) in Step 1 of the builder:

1. **Brand Extraction:**
   Before crawling subpages, the system fetches the raw homepage HTML and runs `extractBrandFromHtml()`:
   - Scans CSS variables (`--primary`, `--accent`, `--main-color`).
   - Analyzes `<meta name="theme-color">` and computed color palettes via Cheerio.
   - Detects the brand's primary font family, dark/light tone, and favicon/logo URL.
   - Automatically populates the bot's widget theme in Step 4 (Branding).

2. **Domain URL Mapping via Firecrawl (`/v1/map`):**
   The crawler posts to Firecrawl's mapping API with a limit of 120 URLs:
   ```ts
   const mapRes = await fetch("https://api.firecrawl.dev/v1/map", {
     method: "POST",
     headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
     body: JSON.stringify({ url: urlInput, limit: 120 })
   });
   ```
   Firecrawl parses the XML sitemap, robot rules, and recursive hyperlinks, returning an array of high-value URLs (menu pages, platters, catering, about, location, contact, FAQ).

3. **Noise Filtering:**
   Irrelevant or low-signal links are automatically filtered out via `isIgnoredUrl()`:
   - Policies (`privacy-policy`, `terms-of-service`, `cookie-policy`)
   - Assets (`.png`, `.jpg`, `.svg`, `.xml`)
   - Anchors and tracking fragments (`#`, `cdn-cgi`)

4. **Deep Page Scraping (`/v1/scrape`):**
   Each valid URL is scraped for clean Markdown:
   - Extracts structured headings (`#`, `##`, `###`), pricing tables, and bullet points.
   - Drops cookie banners, navigation bars, and repetitive footers.
   - Returns a structured `CrawledPage` array containing `{ url, title, markdown }`.

5. **Local Cheerio Fallback (`services/crawler/local.ts`):**
   If `FIRECRAWL_API_KEY` is not present or an endpoint rate-limits, the crawler gracefully cascades to an internal headless Cheerio scraper combined with `turndown` for HTML-to-Markdown conversion.

---

## 4. Deep Dive: Chunking & Knowledge Base (KB) Generation

### Semantic Paragraph Chunking (`services/ingestions/chunker.ts`)
Raw markdown cannot be dumped as a single text block into a vector database or LLM prompt. Tensor-Bot uses an intelligent semantic chunker:

- **Paragraph Boundary Splitting:**
  Instead of cutting text at arbitrary character intervals (which breaks sentences and pricing tables), the chunker splits on double line breaks (`\n\s*\n+`).
- **Optimal Chunk Sizing:**
  - Standard Chunk Window: **800 to 1,200 characters**.
  - Sliding Overlap: **150 characters** (`chunkOverlap`) to ensure context across boundaries is never severed.
- **Deduplication:**
  Every chunk calculates a SHA-256 `content_hash`. If a page contains repetitive navigation or identical disclaimers, duplicates are discarded before indexing.
- **Metadata Association:**
  Each chunk is stored with its source metadata:
  ```json
  {
    "bot_id": "f2dadb13-5fd5-4f91-b696-c109a2c24e7a",
    "source_id": "87c74ea7-...",
    "chunk_index": 0,
    "content": "Build-Your-Own Partition Platter (2 Veg Curries) - $11.99...",
    "metadata": {
      "title": "Signature Partition Platters",
      "url": "https://knightscurryexpress.com/menu/platters"
    }
  }
  ```

---

## 5. Deep Dive: Vector Storage & Similarity Retrieval

### Vector Indexing in YugabyteDB (`services/yugabyte/client.ts`)
1. **Embedding Generation:**
   Each text chunk is converted into a 768-dimensional dense vector using `GeminiEmbeddingProvider` (`gemini-embedding-001` with deterministic fallbacks).
2. **Distributed SQL Schema:**
   Chunks are inserted into the `chunks` table in YugabyteDB Cloud:
   ```sql
   CREATE TABLE chunks (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
       source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
       content TEXT NOT NULL,
       embedding vector(768),
       metadata JSONB DEFAULT '{}'::jsonb,
       created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```
3. **Sub-50ms HNSW Cosine Search:**
   When a user asks a question, Tensor-Bot embeds the query and searches top chunks using cosine distance (`<=>`):
   ```sql
   SELECT content, metadata, 1 - (embedding <=> $1::vector) AS similarity
   FROM chunks
   WHERE bot_id = $2 AND embedding IS NOT NULL
   ORDER BY embedding <=> $1::vector ASC
   LIMIT 6;
   ```

---

## 6. Deep Dive: Meko MCP Context & Dual-Brain Memory

### What is Meko MCP? (`services/meko/client.ts`)
Meko is an autonomous memory server connected via the **Model Context Protocol (MCP)** over SSE JSON-RPC 2.0 (`https://mcp.mekodata.ai/mcp`). While vector databases store static crawled pages, **Meko provides active, cross-session conversational memory and dynamic knowledge retrieval**.

### Meko Dual-Brain Flow:
1. **Parallel Recall (`recallMekoContext`):**
   When a visitor submits a message (e.g. *"What platters do you have?"*):
   - **Brain 1 (YugabyteDB):** Retrieves vector-similarity chunks from indexed web pages.
   - **Brain 2 (Meko MCP):** Calls `memory_search` and `context_search` scoped by `conversation_id: botId` to retrieve high-confidence business facts and previous interactions.
   - Both results are merged into the LLM prompt.

2. **Synthesis & Answering (`services/gemini/chat.ts`):**
   - The combined context is formatted with strict RAG instructions to prevent hallucinations.
   - If the LLM provider has quota issues or latency spikes, Tensor-Bot's **Semantic Synthesizer** scans the Meko memories and top chunks, formatting structured, accurate menu items, platter options, and operating hours.

3. **Continuous Learning (`storeMekoContext`):**
   - After answering, verified business context is sent to Meko via `memory_add`:
     ```json
     {
       "conversation_id": "f2dadb13-5fd5-4f91-b696-c109a2c24e7a",
       "text": "Partition Platters include basmati rice, warm naan, and dessert. Options range from $11.99 to $16.99."
     }
     ```
   - This ensures the bot's knowledge deepens over time across all visitor conversations.

---

## 7. Deep Dive: How Users Deploy Tensor-Bot to Their Website

Tensor-Bot provides three deployment methods suited for any web architecture:

### 1. Vanilla HTML / CDN Script Tag (Any Website: WordPress, Shopify, Webflow, Wix, HTML)
Users copy a single line of JavaScript into their website's `<head>` or before `</body>`:

```html
<script
  src="https://tensor-bot-beta.vercel.app/widget.js"
  data-bot-id="614ed633075f06edd232de01"
  data-color="#DC2626"
  async>
</script>
```

#### How `widget.js` Operates:
- **Zero Dependencies:** Pure vanilla JavaScript (~3KB).
- **Zero Style Leakage:** Renders a floating circular launcher with brand colors and injects an isolated `<iframe>` pointing to `https://tensor-bot-beta.vercel.app/widget/[publicId]`. The host website's CSS can never break the widget, nor can the widget break the host site.
- **Mobile Responsive:** Adapts from a floating drawer on desktop (`400px x 640px`) to full-screen mobile view on viewports `<480px`.
- **Custom Branding:** Dynamically reads `data-color` or the bot's saved primary brand color to match the client's design identity.

### 2. React / Next.js Component
For modern single-page applications, users can mount the widget natively:

```tsx
import { TensorBotWidget } from "@tensorbot/react";

export default function App() {
  return (
    <TensorBotWidget
      botId="614ed633075f06edd232de01"
      primaryColor="#DC2626"
    />
  );
}
```

### 3. Direct Public Standalone URL
Every assistant has a dedicated public URL for previews, customer support links, QR codes on restaurant tables, or social bios:
```
https://tensor-bot-beta.vercel.app/widget/614ed633075f06edd232de01
```

---

## 8. Summary of System Interactions

| Component | Responsibility | Tech Stack |
| :--- | :--- | :--- |
| **Frontend Dashboard** | 5-step wizard, interactive sandbox, live metrics | Next.js 16 App Router, Tailwind CSS, Lucide icons |
| **Crawler Engine** | Sitemaps, multi-page deep crawling, brand color extraction | Firecrawl API (`/v1/map`, `/v1/scrape`), Cheerio, Turndown |
| **Ingestion Pipeline** | Paragraph chunking, sliding overlap, deduplication | Custom TypeScript semantic chunker, SHA-256 |
| **Vector DB** | Dense vector storage, cosine similarity indexing | YugabyteDB Cloud (Distributed Postgres), pgvector (HNSW) |
| **Memory Engine** | Persistent cross-session knowledge & context | Meko MCP (Model Context Protocol, JSON-RPC 2.0 SSE) |
| **LLM Engine** | RAG generation, grounding prompt, fallback synthesis | Gemini 2.5 / 3.8 Flash, Gemini Embeddings |
| **Distribution / Embed** | Client-side launcher, isolated iframe, CDN delivery | Vanilla JS `widget.js`, Next.js Edge routes |

