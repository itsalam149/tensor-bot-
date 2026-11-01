import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GeminiEmbeddingProvider } from "@/services/gemini/embedder";
import { MockEmbeddingProvider } from "@/services/ingestions/embedder";
import { generateAnswer, type RetrievedChunk } from "@/services/gemini/chat";
import { recallMekoContext, storeMekoContext } from "@/services/meko/client";
import { isYugabyteEnabled, searchKnowledge, queryYugabyte } from "@/services/yugabyte/client";
import { dbGetBotByPublicId } from "@/services/db";

// Very small in-memory rate limiter (per-process). Swap for a durable store
// (Upstash/Redis) before production — see docs/PRODUCT_ROADMAP.md.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const requestLog = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  requestLog.set(key, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(`${publicId}:${ip}`)) {
    return NextResponse.json({ success: false, error: "Too many requests, slow down." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const _visitorId = typeof body.visitorId === "string" ? body.visitorId : null;

  if (!question) {
    return NextResponse.json({ success: false, error: "question is required." }, { status: 400 });
  }

  const startedAt = Date.now();
  let bot: { id: string; name: string; status: string } | null = null;

  const botRecord = await dbGetBotByPublicId(publicId);
  if (botRecord) {
    bot = { id: botRecord.id, name: botRecord.name, status: botRecord.status };
  }

  if (!bot || (bot.status !== "ready" && bot.status !== "draft")) {
    return NextResponse.json({ success: false, error: "This assistant isn't available." }, { status: 404 });
  }

  try {
    const embedder = process.env.GEMINI_API_KEY
      ? new GeminiEmbeddingProvider()
      : {
          embedQuery: async (q: string) => {
            const mock = new MockEmbeddingProvider();
            const res = await mock.embedMany([q]);
            return res[0];
          },
        };

    const queryEmbedding = await embedder.embedQuery(question);

    let chunks: RetrievedChunk[] = [];

    // 1. Try YugabyteDB first
    if (isYugabyteEnabled()) {
      try {
        const ybChunks = await searchKnowledge(bot.id, queryEmbedding, 6);
        if (ybChunks.length > 0) {
          chunks = ybChunks.map((c) => ({
            content: c.content,
            metadata: (c.metadata as Record<string, unknown>) ?? {},
            similarity: c.similarity,
          }));
        }
      } catch (err) {
        console.warn("[WIDGET CHAT] Yugabyte search failed, trying Supabase fallback:", err);
      }
    }

    // 2. Fallback to Supabase vector search if needed
    if (chunks.length === 0) {
      try {
        const supabase = createAdminClient();
        const { data: matchedChunks } = await supabase.rpc("match_chunks", {
          query_embedding: queryEmbedding,
          match_count: 6,
          filter_bot_id: bot.id,
        });
        chunks = (matchedChunks ?? []) as RetrievedChunk[];
      } catch {
        // ignore
      }
    }

    // 3. Meko Agent Memory Recall
    const mekoMemory = await recallMekoContext({ botId: bot.id, question });

    const generated = await generateAnswer({
      question,
      chunks,
      botName: bot.name,
      mekoContext: mekoMemory.recalled,
      history: Array.isArray(body.history) ? body.history : [],
    });

    const latencyMs = Date.now() - startedAt;

    // 4. Meko Agent Memory Store (Async)
    storeMekoContext({
      botId: bot.id,
      kind: "answer",
      content: `User asked: "${question}"\nAssistant replied: "${generated.answer}"`,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      answer: generated.answer,
      sources: chunks.map((c) => ({
        similarity: c.similarity,
        title: c.metadata?.title,
        url: c.metadata?.url,
      })),
      latencyMs,
      meko: {
        enabled: mekoMemory.enabled,
        recalled: mekoMemory.recalled.length > 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message ?? "Failed to generate answer." },
      { status: 500 }
    );
  }
}
