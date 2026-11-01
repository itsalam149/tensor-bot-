import { createAdminClient } from "@/lib/supabase/admin";
import { crawlWebsite } from "../crawler";
import { parseFile } from "../parser";
import { GeminiEmbeddingProvider } from "../gemini/embedder";
import { ingestToEmbeddings } from "./ingest";
import { MockEmbeddingProvider, type EmbeddingProvider } from "./embedder";
import type { EmbeddedChunkRecord } from "./types";
import { storeMekoContext } from "../meko/client";
import { isYugabyteEnabled, persistKnowledgeRecords, queryYugabyte } from "../yugabyte/client";

export type ProcessSourceResult = {
  success: boolean;
  error?: string;
  pageCount?: number;
  chunkCount?: number;
  brand?: {
    primaryColor: string;
    accentColor: string;
    font: string;
    tone: string;
    logoUrl?: string;
  };
};

async function setSourceStatus(
  sourceId: string,
  status: string,
  extra: { page_count?: number; error_message?: string | null; processed_at?: string } = {}
) {
  if (isYugabyteEnabled()) {
    try {
      const keys = ["status = $2"];
      const vals: any[] = [sourceId, status];
      if (extra.page_count !== undefined) {
        vals.push(extra.page_count);
        keys.push(`page_count = $${vals.length}`);
      }
      if (extra.error_message !== undefined) {
        vals.push(extra.error_message);
        keys.push(`error_message = $${vals.length}`);
      }
      if (extra.processed_at !== undefined) {
        vals.push(extra.processed_at);
        keys.push(`processed_at = $${vals.length}`);
      }
      await queryYugabyte(
        `UPDATE sources SET ${keys.join(", ")}, updated_at = NOW() WHERE id = $1`,
        vals
      );
      return;
    } catch (err) {
      console.warn("[Yugabyte] Failed to update source status:", err);
    }
  }

  // Supabase fallback
  try {
    const supabase = createAdminClient();
    await supabase
      .from("sources")
      .update({ status, ...extra })
      .eq("id", sourceId);
  } catch {
    // ignore
  }
}

export async function processWebsiteSource(params: {
  botId: string;
  sourceId: string;
  url: string;
  chunkSize?: number;
  chunkOverlap?: number;
}): Promise<ProcessSourceResult> {
  const { botId, sourceId, url } = params;

  try {
    await setSourceStatus(sourceId, "crawling");

    const crawl = await crawlWebsite(url);
    if (!crawl.success) {
      await setSourceStatus(sourceId, "failed", {
        error_message: crawl.error ?? "Crawl failed",
      });
      return { success: false, error: crawl.error };
    }

    await setSourceStatus(sourceId, "chunking", {
      page_count: crawl.pages.length,
    });

    const embedder = resolveEmbedder();

    const outcome = await ingestToEmbeddings(
      {
        botId,
        sourceId,
        crawledPages: crawl.pages,
        parsedDocument: await Promise.all(
          crawl.files.map((file) => parseFile(file.buffer, file.fileName, file.mimeType))
        ),
        chunkSize: params.chunkSize,
        chunkOverlap: params.chunkOverlap,
      },
      embedder
    );

    if (!outcome.success) {
      await setSourceStatus(sourceId, "failed", {
        error_message: outcome.error,
      });
      return { success: false, error: outcome.error };
    }

    // Persist records to YugabyteDB or Supabase
    if (isYugabyteEnabled()) {
      await persistKnowledgeRecords(outcome.records);
    } else {
      try {
        const supabase = createAdminClient();
        await persistRecords(supabase, outcome.records);
      } catch (err: any) {
        console.warn("Supabase persistence failed:", err);
      }
    }

    // Store Meko context asynchronously
    storeMekoContext({
      botId,
      kind: "ingestion",
      content: `Ingested ${crawl.pages.length} web pages and ${crawl.files.length} discovered PDFs from ${url}.`,
    }).catch(() => {});

    if (crawl.brand && isYugabyteEnabled()) {
      try {
        await queryYugabyte(
          `UPDATE bots SET branding = COALESCE(branding, '{}'::jsonb) || $1::jsonb, website_url = $2 WHERE id = $3`,
          [JSON.stringify(crawl.brand), url, botId]
        );
      } catch (err) {
        console.warn("Failed to persist detected brand to bot:", err);
      }
    }

    await setSourceStatus(sourceId, "completed", {
      processed_at: new Date().toISOString(),
      error_message: null,
      page_count: crawl.pages.length,
    });

    return {
      success: true,
      pageCount: crawl.pages.length,
      chunkCount: outcome.records.length,
      brand: crawl.brand,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process website.";
    await setSourceStatus(sourceId, "failed", { error_message: message });
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
  const { botId, sourceId, buffer, fileName, mimeType } = params;

  try {
    await setSourceStatus(sourceId, "extracting");

    const parsed = await parseFile(buffer, fileName, mimeType);
    const textContent = (parsed as any).content ?? (parsed as any).text ?? "";
    if (!textContent || textContent.trim().length === 0) {
      await setSourceStatus(sourceId, "failed", {
        error_message: "No text could be extracted from this file.",
      });
      return { success: false, error: "No text could be extracted from this file." };
    }

    await setSourceStatus(sourceId, "chunking");

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
      await setSourceStatus(sourceId, "failed", {
        error_message: outcome.error,
      });
      return { success: false, error: outcome.error };
    }

    if (isYugabyteEnabled()) {
      await persistKnowledgeRecords(outcome.records);
    } else {
      try {
        const supabase = createAdminClient();
        await persistRecords(supabase, outcome.records);
      } catch (err: any) {
        console.warn("Supabase persistence failed:", err);
      }
    }

    await setSourceStatus(sourceId, "completed", {
      processed_at: new Date().toISOString(),
      error_message: null,
    });

    return { success: true, chunkCount: outcome.records.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process file.";
    await setSourceStatus(sourceId, "failed", { error_message: message });
    return { success: false, error: message };
  }
}

function resolveEmbedder(): EmbeddingProvider {
  if (process.env.GEMINI_API_KEY) {
    return new GeminiEmbeddingProvider();
  }
  return new MockEmbeddingProvider();
}

async function persistRecords(
  supabase: ReturnType<typeof createAdminClient>,
  records: EmbeddedChunkRecord[]
) {
  if (!records || records.length === 0) return;

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
