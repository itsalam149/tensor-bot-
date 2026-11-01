import { Pool, QueryResultRow } from "pg";
import type { EmbeddedChunkRecord } from "../ingestions/types";

let pool: Pool | undefined;
let circuitBreakerTrippedUntil = 0;

export function isYugabyteEnabled(): boolean {
  const url = process.env.YUGABYTE_DATABASE_URL;
  if (!url) return false;
  // Ignore placeholder URLs
  if (url.includes("@host:") || url.includes("@your-host") || url.includes("@example.")) {
    return false;
  }
  // If circuit breaker is active due to unreachable DB, temporarily bypass to prevent page freezes
  if (Date.now() < circuitBreakerTrippedUntil) {
    return false;
  }
  return true;
}

export function getPool(): Pool {
  if (!process.env.YUGABYTE_DATABASE_URL) {
    throw new Error("YUGABYTE_DATABASE_URL is not configured.");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.YUGABYTE_DATABASE_URL,
      ssl: process.env.YUGABYTE_SSL === "false" ? false : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 1000, // 1s fast failover
      keepAlive: true,
      keepAliveInitialDelayMillis: 1000,
    });

    pool.on("error", (err) => {
      console.warn("[YUGABYTE POOL] Client socket error (evicting client):", err.message);
    });
  }
  return pool;
}

export async function queryYugabyte<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  if (!isYugabyteEnabled()) {
    throw new Error("YugabyteDB is currently paused or unreachable (circuit breaker active).");
  }

  const p = getPool();
  try {
    const res = await p.query<T>(text, params);
    // Successful query resets circuit breaker
    circuitBreakerTrippedUntil = 0;
    return res.rows;
  } catch (err: any) {
    const msg = String(err?.message || "");
    const isTimeout =
      msg.includes("connection timeout") ||
      msg.includes("ETIMEDOUT") ||
      msg.includes("ECONNREFUSED") ||
      msg.includes("Connection terminated");

    if (isTimeout) {
      // Trip circuit breaker for 1 hour to prevent freezing UI requests
      circuitBreakerTrippedUntil = Date.now() + 3600000;
      console.warn(`[YUGABYTE] Database connection degraded (${msg.slice(0, 60)}), activating circuit breaker fallback.`);
    }

    throw err;
  }
}

function vectorLiteral(values: number[]): string {
  return `[${values.join(",")}]`;
}

export async function persistKnowledgeRecords(records: EmbeddedChunkRecord[]): Promise<boolean> {
  if (records.length === 0) return true;
  if (!isYugabyteEnabled()) return false;

  let client;
  try {
    client = await getPool().connect();
  } catch (connErr) {
    console.warn("[YUGABYTE] Could not connect to YugabyteDB, skipping Yugabyte persistence:", connErr);
    return false;
  }

  try {
    await client.query("BEGIN");
    const groups = new Map<string, EmbeddedChunkRecord[]>();
    for (const record of records) {
      const key = `${record.title}::${String(record.metadata.url ?? record.metadata.fileName ?? "")}`;
      groups.set(key, [...(groups.get(key) ?? []), record]);
    }

    for (const group of groups.values()) {
      const first = group[0];
      const document = await client.query(
        `INSERT INTO documents (bot_id, source_id, title, content, origin_url, metadata)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb) RETURNING id`,
        [
          first.botId,
          first.sourceId,
          first.title,
          group.map((item) => item.chunkText).join("\n\n"),
          first.metadata.url ?? null,
          JSON.stringify(first.metadata),
        ]
      );
      const documentId = document.rows[0].id;
      for (const chunk of group) {
        await client.query(
          `INSERT INTO chunks (document_id, bot_id, source_id, chunk_index, content, content_hash, metadata, embedding)
           VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::vector)`,
          [
            documentId,
            chunk.botId,
            chunk.sourceId,
            chunk.chunkIndex,
            chunk.chunkText,
            chunk.contentHash,
            JSON.stringify(chunk.metadata),
            vectorLiteral(chunk.embedding),
          ]
        );
      }
    }
    await client.query("COMMIT");
    console.log(`[YUGABYTE] Successfully persisted ${records.length} chunks to knowledge chunks`);
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[YUGABYTE] Failed to persist records:", error);
    return false;
  } finally {
    client.release();
  }
}

export async function searchKnowledge(botId: string, embedding: number[], limit = 6) {
  if (!isYugabyteEnabled()) return [];

  try {
    const rows = await queryYugabyte<{
      id: string;
      content: string;
      metadata: Record<string, unknown>;
      similarity: number;
    }>(
      `SELECT
         id,
         content,
         metadata,
         1 - (embedding <=> $1::vector) AS similarity
       FROM chunks
       WHERE bot_id = $2 AND embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector ASC
       LIMIT $3`,
      [vectorLiteral(embedding), botId, limit]
    );

    return rows.map((r) => ({
      id: r.id,
      content: r.content,
      metadata: r.metadata ?? {},
      similarity: Number(r.similarity),
    }));
  } catch (error) {
    console.error("[YUGABYTE] Search failed:", error);
    return [];
  }
}
