import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getAuthUserOrAdmin } from "@/lib/supabase/admin";
import { processFileSource, processWebsiteSource } from "@/services/ingestions/pipeline";
import { isYugabyteEnabled, queryYugabyte } from "@/services/yugabyte/client";
import { dbCreateSource } from "@/services/db";

async function resolveUser() {
  const current = await getCurrentUser();
  if (current) return current;
  const { user } = await getAuthUserOrAdmin();
  return user;
}

async function ensureBot(botId: string, userId: string): Promise<string> {
  if (isYugabyteEnabled()) {
    const rows = await queryYugabyte("SELECT id FROM bots WHERE id = $1 LIMIT 1", [botId]);
    if (rows.length > 0) return rows[0].id;

    const inserted = await queryYugabyte(
      "INSERT INTO bots (id, owner_id, name, status) VALUES ($1, $2, 'My AI Assistant', 'draft') RETURNING id",
      [botId, userId]
    );
    return inserted[0]?.id ?? botId;
  }

  const { db } = await getAuthUserOrAdmin();
  const { data: bot } = await db.from("bots").select("id").eq("id", botId).single();
  if (bot) return bot.id;

  const { data: newBot } = await db
    .from("bots")
    .insert({ id: botId, owner_id: userId, name: "My AI Assistant", status: "draft" })
    .select("id")
    .single();

  return newBot?.id ?? botId;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: botId } = await params;
  const user = await resolveUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unable to resolve user session." }, { status: 401 });
  }

  if (isYugabyteEnabled()) {
    try {
      const sources = await queryYugabyte(
        "SELECT * FROM sources WHERE bot_id = $1 ORDER BY created_at ASC",
        [botId]
      );
      return NextResponse.json({ success: true, sources });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }

  const { db } = await getAuthUserOrAdmin();
  const { data: sources, error } = await db
    .from("sources")
    .select("*")
    .eq("bot_id", botId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, sources: sources || [] });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawBotId } = await params;
  const user = await resolveUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unable to resolve user session." }, { status: 401 });
  }

  const botId = await ensureBot(rawBotId, user.id);
  const contentType = request.headers.get("content-type") ?? "";

  // ---- File upload branch ----
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "File is required." }, { status: 400 });
    }

    try {
      const source = await dbCreateSource(botId, {
        type: "file",
        file_name: file.name,
        file_type: file.type || file.name.split(".").pop(),
      });

      const buffer = Buffer.from(await file.arrayBuffer());

      const result = await processFileSource({
        botId,
        sourceId: source.id,
        buffer,
        fileName: file.name,
        mimeType: file.type,
      });

      return NextResponse.json({
        success: result.success,
        source,
        chunkCount: result.chunkCount,
        error: result.error,
      });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }

  // ---- JSON branch ----
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

    try {
      const source = await dbCreateSource(botId, {
        type: "website",
        input_url: url,
      });

      const result = await processWebsiteSource({ botId, sourceId: source.id, url });

      return NextResponse.json({
        success: result.success,
        source,
        pageCount: result.pageCount,
        chunkCount: result.chunkCount,
        brand: result.brand,
        error: result.error,
      });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
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

    try {
      const source = await dbCreateSource(botId, {
        type: "qna",
        file_name: question.slice(0, 80),
      });

      const result = await processFileSource({
        botId,
        sourceId: source.id,
        buffer: Buffer.from(`${question}\n\n${answer}`, "utf-8"),
        fileName: `${question.slice(0, 60)}.txt`,
        mimeType: "text/plain",
      });

      return NextResponse.json({
        success: result.success,
        source,
        chunkCount: result.chunkCount,
        error: result.error,
      });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, error: "Unsupported source type." }, { status: 400 });
}
