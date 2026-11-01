-- ============================================================
-- Tensor Bot - Full Production YugabyteDB Database Schema
-- Run this in your YugabyteDB SQL Shell (ysqlsh) or Cloud Query Editor
-- ============================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Users Table (Authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- 3. User Sessions Table (Stateful Cookie-based Auth)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_sessions_token_idx ON user_sessions(token);
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id);

-- 4. Bots / Assistants Table
CREATE TABLE IF NOT EXISTS bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Assistant',
  description TEXT,
  website_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'ready', 'failed')),
  public_id TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  branding JSONB NOT NULL DEFAULT '{}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{
    "crawlLimit": 20,
    "chunkSize": 1200,
    "chunkOverlap": 150,
    "topK": 6
  }'::jsonb,
  live_data JSONB NOT NULL DEFAULT '{"enabled": false, "tools": []}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bots_owner_id_idx ON bots(owner_id);
CREATE INDEX IF NOT EXISTS bots_public_id_idx ON bots(public_id);

-- 5. Knowledge Sources Table
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('website', 'file', 'qna')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'crawling', 'extracting', 'chunking', 'embedding', 'completed', 'failed')),
  input_url TEXT,
  file_name TEXT,
  file_type TEXT,
  file_path TEXT,
  page_count INT,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sources_bot_id_idx ON sources(bot_id);

-- 6. Knowledge Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  origin_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS documents_bot_id_idx ON documents(bot_id);
CREATE INDEX IF NOT EXISTS documents_source_id_idx ON documents(source_id);

-- 7. Knowledge Chunks Table (Vector Embeddings 768-dimensions)
CREATE TABLE IF NOT EXISTS chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding VECTOR(768),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chunks_bot_id_idx ON chunks(bot_id);
CREATE INDEX IF NOT EXISTS chunks_document_id_idx ON chunks(document_id);
CREATE INDEX IF NOT EXISTS chunks_embedding_hnsw_idx ON chunks USING hnsw (embedding vector_cosine_ops);

-- 8. Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  visitor_id TEXT,
  source TEXT NOT NULL DEFAULT 'widget' CHECK (source IN ('widget', 'playground')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_sessions_bot_id_idx ON chat_sessions(bot_id);

-- 9. Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources_used JSONB,
  latency_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages(session_id);

-- 10. Vector Similarity Search Function (Cosine Distance)
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding VECTOR(768),
  match_count INT DEFAULT 6,
  filter_bot_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.content,
    c.metadata,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM chunks c
  WHERE (filter_bot_id IS NULL OR c.bot_id = filter_bot_id)
    AND c.embedding IS NOT NULL
  ORDER BY c.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;

