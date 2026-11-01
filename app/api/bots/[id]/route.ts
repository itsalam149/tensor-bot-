import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getAuthUserOrAdmin } from "@/lib/supabase/admin";
import { dbGetBotWithSources, dbUpdateBot, dbDeleteBot } from "@/services/db";

const PATCHABLE_FIELDS = ["name", "description", "website_url", "branding", "settings", "live_data"] as const;

async function resolveUser() {
  const current = await getCurrentUser();
  if (current) return current;
  const { user } = await getAuthUserOrAdmin();
  return user;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { bot, sources } = await dbGetBotWithSources(id);
    if (!bot) {
      return NextResponse.json({ success: false, error: "Bot not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, bot, sources });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await resolveUser();

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

  try {
    const bot = await dbUpdateBot(id, patch);
    return NextResponse.json({ success: true, bot });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await resolveUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unable to resolve user session." }, { status: 401 });
  }

  try {
    await dbDeleteBot(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
