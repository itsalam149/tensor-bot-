# Product Roadmap — Website-to-Chatbot Platform

_Last updated: this session. See `docs/backend.prd.md` for the original PRD this builds on._

## 1. What this product does

A business gives us their website URL + support docs (+ optionally a live
DB/API). We crawl and index that content, and deliver:

1. A CDN `<script>` tag that drops a styled chat widget onto their site.
2. A React component for teams that want native embedding.
3. A hosted backend that answers questions grounded in their content, and
   can call their own APIs (their key, not ours) for live things like order
   status or stock levels.

Billing is per-message, not per-API-cost.

## 2. Audit: what existed before this session

| Area | State |
|---|---|
| Auth (Supabase) | ✅ Fully working — sign up/in, reset password, middleware-protected routes |
| Crawler (`services/crawler`) | ✅ Real Firecrawl integration |
| Parser (`services/parser`) | ✅ Real PDF/DOCX/TXT parsing |
| Ingestion pipeline (`services/ingestions`) | ✅ Solid normalize → dedupe → chunk logic, but embeddings were mocked and nothing was persisted |
| Database schema | ❌ Did not exist — Supabase was auth-only |
| Bots/Sources/Chat APIs | ❌ Did not exist |
| Create-Assistant wizard UI | ❌ Static mockup — hardcoded stepper, hardcoded example data, 5 of ~13 components were empty files, no state, "Continue" did nothing |
| Dashboard | ❌ Empty shell |
| Widget delivery (CDN script / React component) | ❌ Did not exist |

## 3. What this session added

- **Schema** (`supabase/migrations/0001_init.sql`): `bots`, `sources`,
  `documents`, `chunks` (pgvector, 768-dim), `jobs`, `chat_sessions`,
  `chat_messages`, RLS policies, and a `match_chunks` similarity-search RPC.
- **Real embeddings**: `services/gemini/embedder.ts` (Gemini
  `text-embedding-004`), swapped in wherever `GEMINI_API_KEY` is set;
  falls back to the existing mock provider otherwise so local dev still runs.
- **Grounded answer generation**: `services/gemini/chat.ts`.
- **Ingestion orchestrator** (`services/ingestions/pipeline.ts`): wires
  crawl/parse → normalize/chunk → embed → persist, updating `sources.status`
  as it goes (`pending → crawling/extracting → chunking → completed/failed`).
- **API routes**:
  - `POST/GET /api/bots` — create/list bots
  - `GET/PATCH/DELETE /api/bots/[id]` — bot detail, branding/settings/live-data updates
  - `POST/GET /api/bots/[id]/sources` — add website / file / Q&A source (kicks off ingestion synchronously)
  - `DELETE/POST /api/bots/[id]/sources/[sourceId]` — remove / retry a source
  - `POST /api/bots/[id]/finalize` — marks a bot `ready`, returns embed snippets
  - `POST /api/bots/[id]/chat` — authenticated playground chat (retrieval + generation)
  - `POST /api/widget/[publicId]/chat` — public, rate-limited widget chat endpoint
- **Wizard state** (`lib/wizard/wizard-context.tsx`, `lib/wizard/api-client.ts`):
  a real `useReducer`-based state machine driving all 5 steps, wired to the
  API routes above.
- **All 5 step panels made functional**: website (real crawl call + status),
  sources (file upload + Q&A), live-data (tool config, saved to `bots.live_data`),
  branding (color/font/tone with live preview), review (summary + deploy +
  generated embed snippets).
- **Previously-empty shared components built out**: `source-card`,
  `integration-card`, `deployment-preview`.
- **Stepper and footer bar made dynamic**: clickable/disabled based on real
  progress, Back/Continue/Deploy wired to the wizard state.
- **CDN widget** (`public/widget.js`): dependency-free vanilla JS chat bubble
  that calls the public widget chat endpoint.

Typecheck (`tsc --noEmit`) and lint are clean on all new/changed files, and
`next build` compiles successfully (the only build failure in this sandbox is
an unrelated Google Fonts network block, not a code issue).

## 4. What's still missing (prioritized)

### Phase 1 — finish the MVP loop (do this next)
1. **Dashboard**: list a user's bots (`GET /api/bots` is ready), with status
   badges and a link back into the wizard for edits post-deploy.
2. **Draft resume**: right now refreshing the wizard loses state (it's only
   in React context). Either (a) load `GET /api/bots/[id]` on mount when a
   `botId` is in the URL, or (b) put `botId` in the URL (`/create/[botId]`)
   and hydrate from there. This is the highest-leverage next task.
3. **Playground**: a simple chat UI in the dashboard hitting
   `POST /api/bots/[id]/chat` so owners can test before deploying.
4. **`@tensorbot/react` package**: the finalize step already generates a
   snippet for it; the package itself doesn't exist yet. Minimal version:
   an iframe or React port of `public/widget.js`.
5. **Env var wiring**: `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `NEXT_PUBLIC_SITE_URL` need to be set in deployment. None of this can be
   verified end-to-end without a live Supabase project + Gemini key.

### Phase 2 — production hardening
1. **Background jobs, not synchronous requests.** `processWebsiteSource` /
   `processFileSource` currently run inline in the API request — fine for a
   handful of pages, but a 50-page crawl will time out a serverless
   function. Move to a queue (Supabase Edge Functions + `pgmq`, Inngest, or
   Trigger.dev) with the `jobs` table already modeled for this.
2. **Live-data tool calling.** The live-data step currently only *saves*
   tool config (name/description/endpoint). Actually calling those
   endpoints at chat time needs a tool-calling loop in `services/gemini/chat.ts`
   (Gemini function calling), plus a secure way to store/inject the
   customer's API key — **never** store raw credentials in the `bots` table
   as currently structured; use a secrets vault (Supabase Vault, or an
   external KMS) and store only a reference.
3. **Design-DNA extraction.** The PRD wants the bot auto-styled from the
   crawled site's colors/fonts. This session intentionally left
   `website-intelligence-panel` honest (defaults, not fake extraction)
   rather than fake it. Real implementation: fetch the homepage HTML,
   extract `<meta theme-color>`, computed CSS custom properties, and/or
   run a lightweight image color-extraction on the OG image / logo.
4. **Usage-based billing.** Nothing here yet — needs a `messages` counter
   per bot, a Stripe metered-billing integration, and a plan/limits model.
5. **Multi-tenant rate limiting / abuse protection** on the public widget
   endpoint — the current limiter is in-memory and per-process, fine for a
   single server, not for multiple instances (swap for Upstash Redis).

### Phase 3 — scale & polish
1. Analytics dashboard (conversation volume, top questions, deflection rate).
2. Bot versioning / rollback.
3. Multi-language support.
4. Team seats / roles (currently one owner per bot via `owner_id`).
5. A proper `/widget.js` build pipeline (currently hand-written vanilla JS —
   fine for MVP, but should eventually be bundled/minified/versioned).

## 5. Target repo shape (once Phase 1 lands)

```
app/
  (dashboard)/
    dashboard/page.tsx          # list bots  ← build next
    create/page.tsx             # wizard entry (exists)
    create/[botId]/page.tsx     # resume-a-draft route ← build next
    bots/[botId]/
      page.tsx                  # bot detail / settings
      playground/page.tsx       # test chat  ← build next
  api/
    bots/route.ts                              ✅
    bots/[id]/route.ts                         ✅
    bots/[id]/sources/route.ts                 ✅
    bots/[id]/sources/[sourceId]/route.ts      ✅
    bots/[id]/finalize/route.ts                ✅
    bots/[id]/chat/route.ts                    ✅
    widget/[publicId]/chat/route.ts            ✅
lib/
  wizard/wizard-context.tsx      ✅
  wizard/api-client.ts           ✅
  supabase/{client,server,admin}.ts
services/
  crawler/  parser/  gemini/  ingestions/
components/
  create-assistant/              ✅ all steps functional
public/
  widget.js                      ✅
supabase/migrations/0001_init.sql ✅
```

## 6. Immediate next action

Run the migration against a real Supabase project, set `GEMINI_API_KEY`,
and do one end-to-end pass: create a bot → crawl a real site → upload a PDF →
deploy → hit the playground endpoint. That will surface any schema/API
mismatches faster than more code review can.
