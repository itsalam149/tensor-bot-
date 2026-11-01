-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents Table
-- Stores the original crawled page or uploaded document
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id TEXT NOT NULL,
    bot_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- The raw markdown or text
    metadata JSONB DEFAULT '{}'::jsonb, -- Store URL, crawl date, type, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Document Chunks Table
-- Stores the smaller chunked pieces of the document with their vector embeddings
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    bot_id TEXT NOT NULL, -- Denormalized for faster filtering by bot
    content TEXT NOT NULL, -- The chunk text
    embedding vector(1536), -- Assuming OpenAI 1536 dims, or 768 for nomic-embed-text. Adjust if needed.
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create an HNSW index for fast similarity search
CREATE INDEX ON public.document_chunks USING hnsw (embedding vector_cosine_ops);

-- RLS (Row Level Security) Policies
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users or service role to read/write based on your auth logic.
-- Example: 
-- CREATE POLICY "Allow full access to authenticated users" ON public.documents FOR ALL USING (auth.role() = 'authenticated');
-- CREATE POLICY "Allow full access to authenticated users" ON public.document_chunks FOR ALL USING (auth.role() = 'authenticated');
