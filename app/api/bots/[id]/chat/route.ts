import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GeminiEmbeddingProvider } from "@/services/gemini/embedder";
import { generateAnswer, type RetrievedChunk } from "@/services/gemini/chat";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: botId } = await params;
  const body = await request.json().catch(() => ({}));

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) {
    return NextResponse.json({ success: false, error: "question is required." }, { status: 400 });
  }

  const startedAt = Date.now();
  const supabase = createAdminClient();

  const { data: bot } = await supabase.from("bots").select("id, name, status").eq("id", botId).single();

  if (!bot) {
    return NextResponse.json({ success: false, error: "Bot not found." }, { status: 404 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      {
        success: false,
        error:
          "GEMINI_API_KEY is not configured on the server, so live answers aren't available yet. See docs/PRODUCT_ROADMAP.md.",
      },
      { status: 501 }
    );
  }

  try {
    const embedder = new GeminiEmbeddingProvider();
    const queryEmbedding = await embedder.embedQuery(question);

    const { data: matches, error: matchError } = await supabase.rpc("match_chunks", {
      p_bot_id: botId,
      p_query_embedding: queryEmbedding,
      p_match_count: 6,
    });

    if (matchError) {
      return NextResponse.json({ success: false, error: matchError.message }, { status: 500 });
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

    return NextResponse.json({
      success: true,
      answer: result.answer,
      sourcesUsed: chunks.map((c) => c.metadata),
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate an answer.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
