import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getAuthUserOrAdmin } from "@/lib/supabase/admin";
import { dbDeleteSource } from "@/services/db";
import { processWebsiteSource } from "@/services/ingestions/pipeline";
import { isYugabyteEnabled, queryYugabyte } from "@/services/yugabyte/client";

async function resolveUser() {
  const current = await getCurrentUser();
  if (current) return current;
  const { user } = await getAuthUserOrAdmin();
  return user;
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; sourceId: string }> }
) {
  const { id: _botId, sourceId } = await params;
  const user = await resolveUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
  }

  try {
    await dbDeleteSource(sourceId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Retry processing
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; sourceId: string }> }
) {
  const { id: botId, sourceId } = await params;
  const user = await resolveUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
  }

  let source: any = null;

  if (isYugabyteEnabled()) {
    const rows = await queryYugabyte("SELECT * FROM sources WHERE id = $1 LIMIT 1", [sourceId]);
    source = rows[0];
  } else {
    const { db } = await getAuthUserOrAdmin();
    const { data } = await db.from("sources").select("*").eq("id", sourceId).single();
    source = data;
  }

  if (!source) {
    return NextResponse.json({ success: false, error: "Source not found." }, { status: 404 });
  }

  if (source.type !== "website" || !source.input_url) {
    return NextResponse.json(
      { success: false, error: "Only website sources can be retried automatically." },
      { status: 400 }
    );
  }

  const result = await processWebsiteSource({
    botId,
    sourceId,
    url: source.input_url,
  });

  return NextResponse.json({
    success: result.success,
    pageCount: result.pageCount,
    chunkCount: result.chunkCount,
    error: result.error,
  });
}
