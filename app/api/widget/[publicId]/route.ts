import { NextRequest, NextResponse } from "next/server";
import { dbGetBotByPublicId } from "@/services/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;

  if (!publicId) {
    return NextResponse.json({ success: false, error: "publicId is required." }, { status: 400 });
  }

  try {
    const bot = await dbGetBotByPublicId(publicId);

    if (!bot) {
      return NextResponse.json({ success: false, error: "Assistant not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      bot: {
        id: bot.id,
        name: bot.name,
        description: bot.description,
        website_url: bot.website_url,
        status: bot.status,
        public_id: bot.public_id,
        branding: bot.branding ?? {},
        settings: bot.settings ?? {},
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
