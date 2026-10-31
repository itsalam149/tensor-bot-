-- Migration 0002: Add missing columns from partial initial schema
-- Safe to run multiple times (uses IF NOT EXISTS / DO blocks).
-- Run this in the Supabase SQL Editor for project: chmqgtwwntmotwborkir

-- ============================================================
-- BOTS — add missing columns if initial migration was partial
-- ============================================================
alter table bots add column if not exists description text;
alter table bots add column if not exists website_url text;
alter table bots add column if not exists public_id text unique default encode(gen_random_bytes(12), 'hex');
alter table bots add column if not exists branding jsonb not null default '{}'::jsonb;
alter table bots add column if not exists settings jsonb not null default '{"crawlLimit":20,"chunkSize":1200,"chunkOverlap":150,"topK":6}'::jsonb;
alter table bots add column if not exists live_data jsonb not null default '{"enabled":false,"tools":[]}'::jsonb;
alter table bots add column if not exists updated_at timestamptz not null default now();

-- ============================================================
-- SOURCES — add missing columns
-- ============================================================
-- name column: the table may already have it as NOT NULL with no default.
-- Set a safe default first so the ALTER doesn't fail on existing null rows.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'sources' and column_name = 'name'
  ) then
    alter table sources add column name text not null default '';
  else
    -- Column exists but may lack a default — set one so inserts without name don't fail
    alter table sources alter column name set default '';
  end if;
end $$;

alter table sources add column if not exists input_url text;
alter table sources add column if not exists file_name text;
alter table sources add column if not exists file_type text;
alter table sources add column if not exists file_path text;
alter table sources add column if not exists page_count int;
alter table sources add column if not exists error_message text;
alter table sources add column if not exists processed_at timestamptz;
alter table sources add column if not exists updated_at timestamptz not null default now();

-- ============================================================
-- DOCUMENTS — create if missing
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
-- CHUNKS — create if missing (requires pgvector extension)
-- ============================================================
create extension if not exists vector;

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
create index if not exists chunks_embedding_idx
  on chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ============================================================
-- JOBS — create if missing
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
-- CHAT SESSIONS / MESSAGES — create if missing
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
-- updated_at triggers (idempotent)
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
-- RLS — enable and create policies (idempotent drops first)
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

-- ============================================================
-- RETRIEVAL RPC (idempotent)
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
