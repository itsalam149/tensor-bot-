import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processWebsiteSource } from "@/services/ingestions/pipeline";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; sourceId: string }> }
) {
  const { id: botId, sourceId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
  }

  const { error } = await supabase.from("sources").delete().eq("id", sourceId).eq("bot_id", botId);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Retry processing — currently supports website sources (file bytes aren't
// retained for MVP, so file retries require re-upload).
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; sourceId: string }> }
) {
  const { id: botId, sourceId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
  }

  const { data: source } = await supabase.from("sources").select("*").eq("id", sourceId).single();

  if (!source) {
    return NextResponse.json({ success: false, error: "Source not found." }, { status: 404 });
  }

  if (source.type !== "website" || !source.input_url) {
    return NextResponse.json(
      { success: false, error: "Only website sources can be retried automatically. Re-upload the file instead." },
      { status: 400 }
    );
  }

  // Clear previously ingested documents/chunks for this source before retry.
  await supabase.from("documents").delete().eq("source_id", sourceId);

  const result = await processWebsiteSource({ botId, sourceId, url: source.input_url });

  const { data: updatedSource } = await supabase.from("sources").select("*").eq("id", sourceId).single();

  return NextResponse.json({
    success: result.success,
    source: updatedSource,
    error: result.error,
  });
}
