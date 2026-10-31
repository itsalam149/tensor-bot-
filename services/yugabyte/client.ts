import { Pool } from "pg";
import type { EmbeddedChunkRecord } from "../ingestions/types";

let pool: Pool | undefined;

export function isYugabyteEnabled() {
  return Boolean(process.env.YUGABYTE_DATABASE_URL);
}

function getPool() {
  if (!process.env.YUGABYTE_DATABASE_URL) {
    throw new Error("YUGABYTE_DATABASE_URL is not configured.");
  }
  pool ??= new Pool({
    connectionString: process.env.YUGABYTE_DATABASE_URL,
    ssl: process.env.YUGABYTE_SSL === "false" ? false : { rejectUnauthorized: false },
    max: 5,
  });
  return pool;
}

function vectorLiteral(values: number[]) {
  return `[${values.join(",")}]`;
}

export async function persistKnowledgeRecords(records: EmbeddedChunkRecord[]) {
  if (records.length === 0) return;
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const groups = new Map<string, EmbeddedChunkRecord[]>();
    for (const record of records) {
      const key = `${record.title}::${String(record.metadata.url ?? record.metadata.fileName ?? "")}`;
      groups.set(key, [...(groups.get(key) ?? []), record]);
    }

    for (const group of groups.values()) {
      const first = group[0];
      const document = await client.query(
        `insert into knowledge_documents (bot_id, source_id, title, content, origin_url, metadata)
         values ($1, $2, $3, $4, $5, $6::jsonb) returning id`,
        [first.botId, first.sourceId, first.title, group.map((item) => item.chunkText).join("\n\n"), first.metadata.url ?? null, JSON.stringify(first.metadata)]
      );
      const documentId = document.rows[0].id;
      for (const chunk of group) {
        await client.query(
          `insert into knowledge_chunks (document_id, bot_id, source_id, chunk_index, content, content_hash, metadata, embedding)
           values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::vector)`,
          [documentId, chunk.botId, chunk.sourceId, chunk.chunkIndex, chunk.chunkText, chunk.contentHash, JSON.stringify(chunk.metadata), vectorLiteral(chunk.embedding)]
        );
      }
    }
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function searchKnowledge(botId: string, embedding: number[], limit = 6) {
  const result = await getPool().query(
    `select content, metadata, 1 - (embedding <=> $2::vector) as similarity
     from knowledge_chunks where bot_id = $1 and embedding is not null
     order by embedding <=> $2::vector limit $3`,
    [botId, vectorLiteral(embedding), limit]
  );
  return result.rows as Array<{ content: string; metadata: Record<string, unknown> | null; similarity: number }>;
}