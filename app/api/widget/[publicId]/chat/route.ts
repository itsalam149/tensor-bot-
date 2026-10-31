import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GeminiEmbeddingProvider } from "@/services/gemini/embedder";
import { generateAnswer, type RetrievedChunk } from "@/services/gemini/chat";

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
  const visitorId = typeof body.visitorId === "string" ? body.visitorId : null;

  if (!question) {
    return NextResponse.json({ success: false, error: "question is required." }, { status: 400 });
  }

  const startedAt = Date.now();
  const supabase = createAdminClient();

  const { data: bot } = await supabase
    .from("bots")
    .select("id, name, status")
    .eq("public_id", publicId)
    .single();

  if (!bot || bot.status !== "ready") {
    return NextResponse.json({ success: false, error: "This assistant isn't available." }, { status: 404 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { success: false, error: "Assistant isn't fully configured yet." },
      { status: 501 }
    );
  }

  try {
    const embedder = new GeminiEmbeddingProvider();
    const queryEmbedding = await embedder.embedQuery(question);

    const { data: matches, error: matchError } = await supabase.rpc("match_chunks", {
      p_bot_id: bot.id,
      p_query_embedding: queryEmbedding,
      p_match_count: 6,
    });

    if (matchError) {
      return NextResponse.json({ success: false, error: "Search failed." }, { status: 500 });
    }

    type MatchRow = { content: string; similarity: number; metadata: Record<string, unknown> | null };
    const chunks: RetrievedChunk[] = ((matches ?? []) as MatchRow[]).map((m) => ({
      content: m.content,
      similarity: m.similarity,
      metadata: m.metadata ?? {},
    }));

    const result = await generateAnswer({
      botName: bot.name,
      question,
      chunks,
      history: Array.isArray(body.history) ? body.history : [],
    });

    // Persist the exchange for analytics / conversation history.
    const { data: session } = await supabase
      .from("chat_sessions")
      .upsert(
        { bot_id: bot.id, visitor_id: visitorId ?? "anonymous", source: "widget" },
        { onConflict: "id" }
      )
      .select("id")
      .maybeSingle();

    if (session?.id) {
      await supabase.from("chat_messages").insert([
        { session_id: session.id, role: "user", content: question },
        {
          session_id: session.id,
          role: "assistant",
          content: result.answer,
          sources_used: chunks.map((c) => c.metadata),
          latency_ms: Date.now() - startedAt,
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      answer: result.answer,
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate an answer.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
