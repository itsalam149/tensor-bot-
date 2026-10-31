import { NextRequest, NextResponse } from "next/server";
import { getAuthUserOrAdmin } from "@/lib/supabase/admin";

const PATCHABLE_FIELDS = ["name", "description", "website_url", "branding", "settings", "live_data"] as const;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, db } = await getAuthUserOrAdmin();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unable to resolve user session." }, { status: 401 });
  }

  const { data: bot, error } = await db.from("bots").select("*").eq("id", id).single();

  if (error || !bot) {
    return NextResponse.json({ success: false, error: "Bot not found." }, { status: 404 });
  }

  const { data: sources } = await db
    .from("sources")
    .select("*")
    .eq("bot_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ success: true, bot, sources: sources ?? [] });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, db } = await getAuthUserOrAdmin();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unable to resolve user session." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  const patch: Record<string, unknown> = {};
  for (const field of PATCHABLE_FIELDS) {
    if (field in body) patch[field] = body[field];
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ success: false, error: "No valid fields to update." }, { status: 400 });
  }

  const { data: bot, error } = await db
    .from("bots")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, bot });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, db } = await getAuthUserOrAdmin();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unable to resolve user session." }, { status: 401 });
  }

  const { error } = await db.from("bots").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

