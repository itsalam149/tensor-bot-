create extension if not exists vector;

create table if not exists knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null,
  source_id uuid not null,
  title text not null,
  content text not null,
  origin_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references knowledge_documents(id) on delete cascade,
  bot_id uuid not null,
  source_id uuid not null,
  chunk_index int not null,
  content text not null,
  content_hash text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(768),
  created_at timestamptz not null default now()
);

create index if not exists knowledge_chunks_bot_id_idx on knowledge_chunks(bot_id);
create index if not exists knowledge_chunks_embedding_idx on knowledge_chunks using hnsw (embedding vector_cosine_ops);