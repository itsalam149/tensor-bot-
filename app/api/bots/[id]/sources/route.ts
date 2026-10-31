import { NextRequest, NextResponse } from "next/server";
import { getAuthUserOrAdmin } from "@/lib/supabase/admin";
import { processFileSource, processWebsiteSource } from "@/services/ingestions/pipeline";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Ensures the bot exists in the DB.
 * If it doesn't exist yet (stale wizard session, page refresh, etc.)
 * auto-creates it so sources can be added without a hard error.
 * Uses the user's own authenticated client so RLS is satisfied.
 */
async function ensureBotExists(
  db: SupabaseClient,
  botId: string,
  userId: string
): Promise<string> {
  const { data: bot } = await db.from("bots").select("id").eq("id", botId).single();

  if (bot) return bot.id;

  // Bot doesn't exist — create it with the requested UUID so the frontend stays in sync
  const { data: newBot, error } = await db
    .from("bots")
    .insert({ id: botId, owner_id: userId, name: "My AI Assistant", status: "draft" })
    .select("id")
    .single();

  if (error || !newBot) {
    // Conflict or RLS issue — create a fresh bot and let the frontend re-sync
    const { data: fallbackBot } = await db
      .from("bots")
      .insert({ owner_id: userId, name: "My AI Assistant", status: "draft" })
      .select("id")
      .single();
    return fallbackBot?.id ?? botId;
  }

  return newBot.id;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: botId } = await params;
  const { user, db } = await getAuthUserOrAdmin();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unable to resolve user session." }, { status: 401 });
  }


  const { data: sources, error } = await db
    .from("sources")
    .select("*")
    .eq("bot_id", botId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, sources });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawBotId } = await params;
  const { user, db } = await getAuthUserOrAdmin();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unable to resolve user session." }, { status: 401 });
  }

  // Auto-create bot if it doesn't exist yet (wizard may add sources before formal creation)
  const botId = await ensureBotExists(db, rawBotId, user.id);

  const contentType = request.headers.get("content-type") ?? "";


  // ---- File upload branch (multipart/form-data) ----
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "File is required." }, { status: 400 });
    }

    const { data: source, error: sourceError } = await db
      .from("sources")
      .insert({
        bot_id: botId,
        name: file.name,
        type: "file",
        status: "pending",
        file_name: file.name,
        file_type: file.type || file.name.split(".").pop(),
      })
      .select("*")
      .single();

    if (sourceError || !source) {
      return NextResponse.json(
        { success: false, error: sourceError?.message ?? "Failed to create source." },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await processFileSource({
      botId,
      sourceId: source.id,
      buffer,
      fileName: file.name,
      mimeType: file.type,
    });

    const { data: updatedSource } = await db.from("sources").select("*").eq("id", source.id).single();

    return NextResponse.json({
      success: result.success,
      source: updatedSource ?? source,
      chunkCount: result.chunkCount,
      error: result.error,
    });
  }

  // ---- JSON branch: website or qna ----
  const body = await request.json().catch(() => ({}));

  if (body.type === "website") {
    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!url) {
      return NextResponse.json({ success: false, error: "url is required." }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid URL format." }, { status: 400 });
    }

    const sourceName = (() => {
      try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url.slice(0, 80); }
    })();

    const { data: source, error: sourceError } = await db
      .from("sources")
      .insert({ bot_id: botId, name: sourceName, type: "website", status: "pending", input_url: url })
      .select("*")
      .single();

    if (sourceError || !source) {
      return NextResponse.json(
        { success: false, error: sourceError?.message ?? "Failed to create source." },
        { status: 500 }
      );
    }

    await db.from("bots").update({ website_url: url }).eq("id", botId);

    const result = await processWebsiteSource({ botId, sourceId: source.id, url });

    const { data: updatedSource } = await db.from("sources").select("*").eq("id", source.id).single();

    return NextResponse.json({
      success: result.success,
      source: updatedSource ?? source,
      pageCount: result.pageCount,
      chunkCount: result.chunkCount,
      error: result.error,
    });
  }

  if (body.type === "qna") {
    const question = typeof body.question === "string" ? body.question.trim() : "";
    const answer = typeof body.answer === "string" ? body.answer.trim() : "";

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: "question and answer are required." },
        { status: 400 }
      );
    }

    const { data: source, error: sourceError } = await db
      .from("sources")
      .insert({ bot_id: botId, name: question.slice(0, 80), type: "qna", status: "pending", file_name: question })
      .select("*")
      .single();

    if (sourceError || !source) {
      return NextResponse.json(
        { success: false, error: sourceError?.message ?? "Failed to create source." },
        { status: 500 }
      );
    }

    const result = await processFileSource({
      botId,
      sourceId: source.id,
      buffer: Buffer.from(`${question}\n\n${answer}`, "utf-8"),
      fileName: `${question.slice(0, 60)}.txt`,
      mimeType: "text/plain",
    });

    const { data: updatedSource } = await db.from("sources").select("*").eq("id", source.id).single();

    return NextResponse.json({
      success: result.success,
      source: updatedSource ?? source,
      chunkCount: result.chunkCount,
      error: result.error,
    });
  }

  return NextResponse.json({ success: false, error: "Unsupported source type." }, { status: 400 });
}
