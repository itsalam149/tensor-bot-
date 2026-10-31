import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GeminiEmbeddingProvider } from "@/services/gemini/embedder";
import { generateAnswer, type RetrievedChunk } from "@/services/gemini/chat";
import { recallMekoContext, storeMekoContext } from "@/services/meko/client";
import { isYugabyteEnabled, searchKnowledge } from "@/services/yugabyte/client";

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

    type MatchRow = { content: string; similarity: number; metadata: Record<string, unknown> | null };
    let matches: MatchRow[];
    if (isYugabyteEnabled()) {
      matches = await searchKnowledge(botId, queryEmbedding, 6);
    } else {
      const result = await supabase.rpc("match_chunks", { p_bot_id: botId, p_query_embedding: queryEmbedding, p_match_count: 6 });
      if (result.error) return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
      matches = (result.data ?? []) as MatchRow[];
    }
    const chunks: RetrievedChunk[] = matches.map((m) => ({
      content: m.content,
      similarity: m.similarity,
      metadata: m.metadata ?? {},
    }));

    const meko = await recallMekoContext({ botId, question });

    const result = await generateAnswer({
      botName: bot.name,
      question,
      chunks,
      history: Array.isArray(body.history) ? body.history : [],
      mekoContext: meko.recalled,
    });
    const stored = await storeMekoContext({ botId, kind: "answer", content: `Question: ${question}\nAnswer: ${result.answer}` });

    return NextResponse.json({
      success: true,
      answer: result.answer,
      sourcesUsed: chunks.map((c) => c.metadata),
      latencyMs: Date.now() - startedAt,
      meko: { ...meko, stored: stored.stored, error: meko.error ?? stored.error },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate an answer.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
