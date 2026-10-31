import { NextRequest, NextResponse } from "next/server";
import { getAuthUserOrAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const { user, db } = await getAuthUserOrAdmin();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unable to resolve user session." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim() : "Untitled Assistant";

  const { data: bot, error } = await db
    .from("bots")
    .insert({ owner_id: user.id, name, status: "draft" })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, bot });
}

export async function GET() {
  const { user, db } = await getAuthUserOrAdmin();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unable to resolve user session." }, { status: 401 });
  }

  const { data: bots, error } = await db
    .from("bots")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, bots });
}

