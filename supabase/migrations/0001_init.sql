-- Tensor Bot MVP schema
-- Run against your Supabase project (SQL editor or `supabase db push`).

create extension if not exists pgcrypto;
create extension if not exists vector;

-- ============================================================
-- BOTS
-- ============================================================
create table if not exists bots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled Assistant',
  description text,
  website_url text,
  status text not null default 'draft'
    check (status in ('draft', 'processing', 'ready', 'failed')),
  public_id text unique not null default encode(gen_random_bytes(12), 'hex'),
  -- {primaryColor, accentColor, font, tone, applyStyling, logoUrl}
  branding jsonb not null default '{}'::jsonb,
  -- {crawlLimit, chunkSize, chunkOverlap, topK, embeddingModel, chatModel}
  settings jsonb not null default '{
    "crawlLimit": 20,
    "chunkSize": 1200,
    "chunkOverlap": 150,
    "topK": 6
  }'::jsonb,
  -- {enabled, tools: [{name, description, endpoint, authRef}]}
  -- NOTE: never store raw API keys/DB passwords in this column in production.
  -- Store a reference to a secret in a vault/kms and keep only non-sensitive
  -- config (tool names, endpoints, schemas) here.
  live_data jsonb not null default '{"enabled": false, "tools": []}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bots_owner_id_idx on bots(owner_id);
create index if not exists bots_public_id_idx on bots(public_id);

-- ============================================================
-- SOURCES
-- ============================================================
create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references bots(id) on delete cascade,
  type text not null check (type in ('website', 'file', 'qna')),
  status text not null default 'pending'
    check (status in ('pending','crawling','extracting','chunking','embedding','completed','failed')),
  input_url text,
  file_name text,
  file_type text,
  file_path text,
  page_count int,
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sources_bot_id_idx on sources(bot_id);

-- ============================================================
-- DOCUMENTS  (one row per crawled page / parsed file)
-- ============================================================
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id) on delete cascade,
  bot_id uuid not null references bots(id) on delete cascade,
  title text,
  content text not null,
  origin_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists documents_bot_id_idx on documents(bot_id);
create index if not exists documents_source_id_idx on documents(source_id);

-- ============================================================
-- CHUNKS  (embedded units used for retrieval)
-- Gemini text-embedding-004 -> 768 dims
-- ============================================================
create table if not exists chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  source_id uuid not null references sources(id) on delete cascade,
  bot_id uuid not null references bots(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  content_hash text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(768),
  created_at timestamptz not null default now()
);

create index if not exists chunks_bot_id_idx on chunks(bot_id);
create index if not exists chunks_document_id_idx on chunks(document_id);
-- ivfflat requires ANALYZE after bulk insert; fine for MVP scale.
create index if not exists chunks_embedding_idx
  on chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ============================================================
-- JOBS  (ingestion pipeline tracking)
-- ============================================================
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references sources(id) on delete cascade,
  job_type text not null,
  status text not null default 'queued'
    check (status in ('queued','running','completed','failed')),
  attempt_count int not null default 0,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists jobs_source_id_idx on jobs(source_id);

-- ============================================================
-- CHAT SESSIONS / MESSAGES
-- ============================================================
create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references bots(id) on delete cascade,
  visitor_id text,
  source text not null default 'widget' check (source in ('widget', 'playground')),
  created_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  sources_used jsonb,
  latency_ms int,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_session_id_idx on chat_messages(session_id);

-- ============================================================
-- updated_at triggers
-- ============================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists bots_set_updated_at on bots;
create trigger bots_set_updated_at before update on bots
  for each row execute function set_updated_at();

drop trigger if exists sources_set_updated_at on sources;
create trigger sources_set_updated_at before update on sources
  for each row execute function set_updated_at();

-- ============================================================
-- RETRIEVAL RPC — cosine similarity search scoped to one bot
-- ============================================================
create or replace function match_chunks(
  p_bot_id uuid,
  p_query_embedding vector(768),
  p_match_count int default 6
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    c.id,
    c.document_id,
    c.content,
    c.metadata,
    1 - (c.embedding <=> p_query_embedding) as similarity
  from chunks c
  where c.bot_id = p_bot_id
    and c.embedding is not null
  order by c.embedding <=> p_query_embedding
  limit p_match_count;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- Dashboard access: only the bot owner (via Supabase auth).
-- Public widget/playground access goes through server routes using the
-- service-role key, which bypasses RLS — RLS below only protects the
-- authenticated dashboard surface.
-- ============================================================
alter table bots enable row level security;
alter table sources enable row level security;
alter table documents enable row level security;
alter table chunks enable row level security;
alter table jobs enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;

drop policy if exists "owners manage their bots" on bots;
create policy "owners manage their bots" on bots
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "owners manage their sources" on sources;
create policy "owners manage their sources" on sources
  for all using (
    exists (select 1 from bots b where b.id = sources.bot_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from bots b where b.id = sources.bot_id and b.owner_id = auth.uid())
  );

drop policy if exists "owners read their documents" on documents;
create policy "owners read their documents" on documents
  for select using (
    exists (select 1 from bots b where b.id = documents.bot_id and b.owner_id = auth.uid())
  );

drop policy if exists "owners read their chunks" on chunks;
create policy "owners read their chunks" on chunks
  for select using (
    exists (select 1 from bots b where b.id = chunks.bot_id and b.owner_id = auth.uid())
  );

drop policy if exists "owners read their jobs" on jobs;
create policy "owners read their jobs" on jobs
  for select using (
    exists (
      select 1 from sources s
      join bots b on b.id = s.bot_id
      where s.id = jobs.source_id and b.owner_id = auth.uid()
    )
  );

drop policy if exists "owners read their chat sessions" on chat_sessions;
create policy "owners read their chat sessions" on chat_sessions
  for select using (
    exists (select 1 from bots b where b.id = chat_sessions.bot_id and b.owner_id = auth.uid())
  );

drop policy if exists "owners read their chat messages" on chat_messages;
create policy "owners read their chat messages" on chat_messages
  for select using (
    exists (
      select 1 from chat_sessions cs
      join bots b on b.id = cs.bot_id
      where cs.id = chat_messages.session_id and b.owner_id = auth.uid()
    )
  );
