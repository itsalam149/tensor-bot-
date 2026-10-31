import { createAdminClient } from "@/lib/supabase/admin";
import { crawlWebsite } from "../crawler";
import { parseFile } from "../parser";
import { GeminiEmbeddingProvider } from "../gemini/embedder";
import { ingestToEmbeddings } from "./ingest";
import { MockEmbeddingProvider, type EmbeddingProvider } from "./embedder";
import type { EmbeddedChunkRecord } from "./types";

export type ProcessSourceResult = {
  success: boolean;
  error?: string;
  pageCount?: number;
  chunkCount?: number;
};

async function setSourceStatus(
  supabase: ReturnType<typeof createAdminClient>,
  sourceId: string,
  status: string,
  extra: Record<string, unknown> = {}
) {
  await supabase
    .from("sources")
    .update({ status, ...extra })
    .eq("id", sourceId);
}

/**
 * Runs the full ingestion pipeline for one source (website or file) and
 * persists documents + embedded chunks to Supabase.
 *
 * MVP note: this runs synchronously inside the API request. Per the PRD
 * this should move to a queue-based background worker before scale —
 * see docs/PRODUCT_ROADMAP.md Phase 2 (job queue).
 */
export async function processWebsiteSource(params: {
  botId: string;
  sourceId: string;
  url: string;
  chunkSize?: number;
  chunkOverlap?: number;
}): Promise<ProcessSourceResult> {
  const supabase = createAdminClient();
  const { botId, sourceId, url } = params;

  try {
    await setSourceStatus(supabase, sourceId, "crawling");

    const crawl = await crawlWebsite(url);
    if (!crawl.success) {
      await setSourceStatus(supabase, sourceId, "failed", {
        error_message: crawl.error ?? "Crawl failed",
      });
      return { success: false, error: crawl.error };
    }

    await setSourceStatus(supabase, sourceId, "chunking", {
      page_count: crawl.pages.length,
    });

    const embedder = resolveEmbedder();

    const outcome = await ingestToEmbeddings(
      {
        botId,
        sourceId,
        crawledPages: crawl.pages,
        chunkSize: params.chunkSize,
        chunkOverlap: params.chunkOverlap,
      },
      embedder
    );

    if (!outcome.success) {
      await setSourceStatus(supabase, sourceId, "failed", {
        error_message: outcome.error,
      });
      return { success: false, error: outcome.error };
    }

    await persistRecords(supabase, outcome.records);

    await setSourceStatus(supabase, sourceId, "completed", {
      processed_at: new Date().toISOString(),
      error_message: null,
    });

    return {
      success: true,
      pageCount: crawl.pages.length,
      chunkCount: outcome.records.length,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ingestion failed.";
    await setSourceStatus(supabase, sourceId, "failed", { error_message: message });
    return { success: false, error: message };
  }
}

export async function processFileSource(params: {
  botId: string;
  sourceId: string;
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
  chunkSize?: number;
  chunkOverlap?: number;
}): Promise<ProcessSourceResult> {
  const supabase = createAdminClient();
  const { botId, sourceId, buffer, fileName, mimeType } = params;

  try {
    await setSourceStatus(supabase, sourceId, "extracting");

    const parsed = await parseFile(buffer, fileName, mimeType);

    await setSourceStatus(supabase, sourceId, "chunking");

    const embedder = resolveEmbedder();

    const outcome = await ingestToEmbeddings(
      {
        botId,
        sourceId,
        parsedDocument: parsed,
        chunkSize: params.chunkSize,
        chunkOverlap: params.chunkOverlap,
      },
      embedder
    );

    if (!outcome.success) {
      await setSourceStatus(supabase, sourceId, "failed", {
        error_message: outcome.error,
      });
      return { success: false, error: outcome.error };
    }

    await persistRecords(supabase, outcome.records);

    await setSourceStatus(supabase, sourceId, "completed", {
      processed_at: new Date().toISOString(),
      error_message: null,
    });

    return { success: true, chunkCount: outcome.records.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process file.";
    await setSourceStatus(supabase, sourceId, "failed", { error_message: message });
    return { success: false, error: message };
  }
}

function resolveEmbedder(): EmbeddingProvider {
  if (process.env.GEMINI_API_KEY) {
    return new GeminiEmbeddingProvider();
  }
  // Falls back to the mock provider (deterministic, low-dimensional) so the
  // pipeline stays runnable in local/dev environments without a Gemini key.
  // Swap for GeminiEmbeddingProvider in production via GEMINI_API_KEY.
  return new MockEmbeddingProvider();
}

async function persistRecords(
  supabase: ReturnType<typeof createAdminClient>,
  records: EmbeddedChunkRecord[]
) {
  if (!records || records.length === 0) return;

  // Group chunks by document (origin title + url/fileName) so we create one
  // `documents` row per page/file, then attach chunks to it.
  const documentKey = (r: (typeof records)[number]) =>
    `${r.title}::${JSON.stringify(r.metadata.url ?? r.metadata.fileName ?? "")}`;

  const groups = new Map<string, typeof records>();
  for (const record of records) {
    const key = documentKey(record);
    const list = groups.get(key) ?? [];
    list.push(record);
    groups.set(key, list);
  }

  for (const [, group] of groups) {
    const first = group[0];

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({
        source_id: first.sourceId,
        bot_id: first.botId,
        title: first.title,
        content: group.map((g) => g.chunkText).join("\n\n"),
        origin_url: (first.metadata.url as string) ?? null,
        metadata: first.metadata,
      })
      .select("id")
      .single();

    if (docError || !doc) {
      throw new Error(docError?.message ?? "Failed to persist document.");
    }

    const chunkRows = group.map((chunk) => ({
      document_id: doc.id,
      source_id: chunk.sourceId,
      bot_id: chunk.botId,
      chunk_index: chunk.chunkIndex,
      content: chunk.chunkText,
      content_hash: chunk.contentHash,
      metadata: chunk.metadata,
      embedding: chunk.embedding,
    }));

    const { error: chunkError } = await supabase.from("chunks").insert(chunkRows);
    if (chunkError) {
      throw new Error(chunkError.message);
    }
  }
}
