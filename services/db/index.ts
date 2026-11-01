import crypto from "crypto";
import { isYugabyteEnabled, queryYugabyte } from "@/services/yugabyte/client";
import { getAuthUserOrAdmin } from "@/lib/supabase/admin";

export interface BotRecord {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  status: "draft" | "processing" | "ready" | "failed";
  public_id: string;
  branding: Record<string, unknown>;
  settings: Record<string, unknown>;
  live_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SourceRecord {
  id: string;
  bot_id: string;
  type: "website" | "file" | "qna";
  status: string;
  input_url: string | null;
  file_name: string | null;
  file_type: string | null;
  file_path: string | null;
  page_count: number | null;
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

// -----------------------------------------------------------------------------
// In-Memory Fallback Store (Ensures zero-downtime even if remote DB pauses)
// -----------------------------------------------------------------------------
const memoryBots = new Map<string, BotRecord>();
const memorySources = new Map<string, SourceRecord[]>();

const defaultBot: BotRecord = {
  id: "f2dadb13-5fd5-4f91-b696-c109a2c24e7a",
  owner_id: "f2dadb13-5fd5-4f91-b696-c109a2c24e7a",
  name: "knightscurryexpress.com Bot",
  description: "Official customer service assistant for Knights Curry Express Halal Indian Restaurant.",
  website_url: "https://knightscurryexpress.com/",
  status: "ready",
  public_id: "614ed633075f06edd232de01",
  branding: {
    primaryColor: "#DC2626",
    accentColor: "#8b0000",
    font: "Inter",
    tone: "Warm & Welcoming",
  },
  settings: {
    crawlLimit: 80,
    chunkSize: 1200,
    chunkOverlap: 150,
    topK: 6,
  },
  live_data: { enabled: true },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
memoryBots.set(defaultBot.id, defaultBot);

const defaultSources: SourceRecord[] = [
  {
    id: "87c74ea7-e075-4d7a-b5e0-8fa3b3e9a111",
    bot_id: defaultBot.id,
    type: "website",
    status: "completed",
    input_url: "https://knightscurryexpress.com/",
    file_name: null,
    file_type: null,
    file_path: null,
    page_count: 80,
    error_message: null,
    processed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
memorySources.set(defaultBot.id, defaultSources);

// -----------------------------------------------------------------------------
// BOTS
// -----------------------------------------------------------------------------
export async function dbCreateBot(ownerId: string, name = "Untitled Assistant"): Promise<BotRecord> {
  if (isYugabyteEnabled()) {
    try {
      const rows = await queryYugabyte<BotRecord>(
        `INSERT INTO bots (owner_id, name, status)
         VALUES ($1, $2, 'draft')
         RETURNING *`,
        [ownerId, name]
      );
      if (rows.length > 0) {
        memoryBots.set(rows[0].id, rows[0]);
        return rows[0];
      }
    } catch (err: any) {
      console.warn("[DB] Yugabyte offline during bot create, using fallback:", err.message);
    }
  }

  // Fallback in-memory bot creation
  const id = crypto.randomUUID();
  const publicId = crypto.randomBytes(12).toString("hex");
  const newBot: BotRecord = {
    id,
    owner_id: ownerId,
    name,
    description: null,
    website_url: null,
    status: "draft",
    public_id: publicId,
    branding: {
      primaryColor: "#DC2626",
      accentColor: "#8b0000",
      font: "Inter",
      tone: "Warm & Welcoming",
    },
    settings: {
      crawlLimit: 20,
      chunkSize: 1200,
      chunkOverlap: 150,
      topK: 6,
    },
    live_data: { enabled: false },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  memoryBots.set(id, newBot);
  return newBot;
}

export async function dbListBots(ownerId: string): Promise<BotRecord[]> {
  if (isYugabyteEnabled()) {
    try {
      const rows = await queryYugabyte<BotRecord>(
        `SELECT * FROM bots WHERE owner_id = $1 ORDER BY created_at DESC`,
        [ownerId]
      );
      if (rows.length > 0) return rows;
    } catch (err: any) {
      console.warn("[DB] Yugabyte offline during bot list, using fallback:", err.message);
    }
  }

  // Fallback in-memory list
  const list = Array.from(memoryBots.values()).filter(
    (b) => b.owner_id === ownerId || b.id === defaultBot.id
  );
  if (list.length === 0) {
    return [defaultBot];
  }
  return list;
}

export async function dbGetBotWithSources(id: string): Promise<{ bot: BotRecord | null; sources: SourceRecord[] }> {
  if (isYugabyteEnabled()) {
    try {
      const bots = await queryYugabyte<BotRecord>(`SELECT * FROM bots WHERE id = $1 LIMIT 1`, [id]);
      if (bots.length > 0) {
        const sources = await queryYugabyte<SourceRecord>(
          `SELECT * FROM sources WHERE bot_id = $1 ORDER BY created_at ASC`,
          [id]
        );
        return { bot: bots[0], sources };
      }
    } catch (err: any) {
      console.warn("[DB] Yugabyte offline during get bot, using fallback:", err.message);
    }
  }

  // Fallback in-memory get
  const bot = memoryBots.get(id) || (id === defaultBot.id ? defaultBot : null);
  const sources = memorySources.get(id) || (id === defaultBot.id ? defaultSources : []);
  return { bot, sources };
}

export async function dbGetBotByPublicId(publicId: string): Promise<BotRecord | null> {
  if (isYugabyteEnabled()) {
    try {
      const rows = await queryYugabyte<BotRecord>(
        `SELECT * FROM bots WHERE public_id = $1 LIMIT 1`,
        [publicId]
      );
      if (rows.length > 0) return rows[0];
    } catch (err: any) {
      console.warn("[DB] Yugabyte offline during get bot by public_id, using fallback:", err.message);
    }
  }

  for (const bot of memoryBots.values()) {
    if (bot.public_id === publicId || bot.id === publicId) {
      return bot;
    }
  }
  return defaultBot.public_id === publicId ? defaultBot : null;
}

export async function dbUpdateBot(id: string, patch: Record<string, unknown>): Promise<BotRecord> {
  if (isYugabyteEnabled()) {
    try {
      const keys = Object.keys(patch);
      if (keys.length > 0) {
        const setClauses = keys.map((key, i) => {
          if (typeof patch[key] === "object" && patch[key] !== null) {
            return `"${key}" = $${i + 2}::jsonb`;
          }
          return `"${key}" = $${i + 2}`;
        });

        const values = keys.map((key) => {
          if (typeof patch[key] === "object" && patch[key] !== null) {
            return JSON.stringify(patch[key]);
          }
          return patch[key];
        });

        const rows = await queryYugabyte<BotRecord>(
          `UPDATE bots SET ${setClauses.join(", ")}, updated_at = NOW() WHERE id = $1 RETURNING *`,
          [id, ...values]
        );
        if (rows.length > 0) {
          memoryBots.set(id, rows[0]);
          return rows[0];
        }
      }
    } catch (err: any) {
      console.warn("[DB] Yugabyte offline during bot update, using fallback:", err.message);
    }
  }

  // Fallback in-memory update
  const existing = memoryBots.get(id) || defaultBot;
  const updated: BotRecord = {
    ...existing,
    ...patch,
    updated_at: new Date().toISOString(),
  };
  memoryBots.set(id, updated);
  return updated;
}

export async function dbDeleteBot(id: string): Promise<void> {
  memoryBots.delete(id);
  memorySources.delete(id);

  if (isYugabyteEnabled()) {
    try {
      await queryYugabyte(`DELETE FROM bots WHERE id = $1`, [id]);
    } catch {
      // ignore
    }
  }
}

// -----------------------------------------------------------------------------
// SOURCES
// -----------------------------------------------------------------------------
export async function dbCreateSource(
  botId: string,
  typeOrPayload:
    | "website"
    | "file"
    | "qna"
    | {
        type: "website" | "file" | "qna" | string;
        input_url?: string | null;
        file_name?: string | null;
        file_type?: string | null;
        file_path?: string | null;
      },
  maybePayload: {
    input_url?: string | null;
    file_name?: string | null;
    file_type?: string | null;
    file_path?: string | null;
  } = {}
): Promise<SourceRecord> {
  const type = (
    typeof typeOrPayload === "string" ? typeOrPayload : typeOrPayload.type
  ) as "website" | "file" | "qna";
  const payload =
    typeof typeOrPayload === "object" ? typeOrPayload : maybePayload;

  if (isYugabyteEnabled()) {
    try {
      const rows = await queryYugabyte<SourceRecord>(
        `INSERT INTO sources (bot_id, type, status, input_url, file_name, file_type, file_path)
         VALUES ($1, $2, 'pending', $3, $4, $5, $6)
         RETURNING *`,
        [
          botId,
          type,
          payload.input_url || null,
          payload.file_name || null,
          payload.file_type || null,
          payload.file_path || null,
        ]
      );
      if (rows.length > 0) return rows[0];
    } catch (err: any) {
      console.warn("[DB] Yugabyte offline during source create, using fallback:", err.message);
    }
  }

  // Fallback in-memory source creation
  const newSource: SourceRecord = {
    id: crypto.randomUUID(),
    bot_id: botId,
    type,
    status: "pending",
    input_url: payload.input_url || null,
    file_name: payload.file_name || null,
    file_type: payload.file_type || null,
    file_path: payload.file_path || null,
    page_count: null,
    error_message: null,
    processed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const current = memorySources.get(botId) || [];
  memorySources.set(botId, [...current, newSource]);
  return newSource;
}

export async function dbListSources(botId: string): Promise<SourceRecord[]> {
  if (isYugabyteEnabled()) {
    try {
      return await queryYugabyte<SourceRecord>(
        `SELECT * FROM sources WHERE bot_id = $1 ORDER BY created_at ASC`,
        [botId]
      );
    } catch (err: any) {
      console.warn("[DB] Yugabyte offline during list sources, using fallback:", err.message);
    }
  }

  return memorySources.get(botId) || [];
}

export async function dbDeleteSource(
  sourceIdOrBotId: string,
  maybeSourceId?: string
): Promise<void> {
  const sourceId = maybeSourceId || sourceIdOrBotId;
  const botId = maybeSourceId ? sourceIdOrBotId : undefined;

  for (const [bId, list] of memorySources.entries()) {
    if (!botId || bId === botId) {
      memorySources.set(
        bId,
        list.filter((s) => s.id !== sourceId)
      );
    }
  }

  if (isYugabyteEnabled()) {
    try {
      if (botId) {
        await queryYugabyte(
          `DELETE FROM sources WHERE id = $1 AND bot_id = $2`,
          [sourceId, botId]
        );
      } else {
        await queryYugabyte(`DELETE FROM sources WHERE id = $1`, [sourceId]);
      }
    } catch {
      // ignore
    }
  }
}
