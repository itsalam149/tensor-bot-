import { NextRequest, NextResponse } from "next/server";
import { getAuthUserOrAdmin } from "@/lib/supabase/admin";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: botId } = await params;
  const { user, db } = await getAuthUserOrAdmin();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unable to resolve user session." }, { status: 401 });
  }

  const { data: sources } = await db
    .from("sources")
    .select("status")
    .eq("bot_id", botId);

  const hasCompletedSource = (sources ?? []).some((s) => s.status === "completed");

  if (!hasCompletedSource) {
    return NextResponse.json(
      { success: false, error: "Add at least one source that finished processing before deploying." },
      { status: 400 }
    );
  }

  const { data: bot, error } = await db
    .from("bots")
    .update({ status: "ready" })
    .eq("id", botId)
    .select("*")
    .single();

  if (error || !bot) {
    return NextResponse.json({ success: false, error: error?.message ?? "Bot not found." }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-domain.com";

  const scriptSnippet = `<script
  src="${siteUrl}/widget.js"
  data-bot-id="${bot.public_id}"
  async
></script>`;

  const reactSnippet = `import { TensorBotWidget } from "@tensorbot/react";

export default function App() {
  return <TensorBotWidget botId="${bot.public_id}" />;
}`;

  return NextResponse.json({
    success: true,
    bot,
    embed: { scriptSnippet, reactSnippet, publicId: bot.public_id },
  });
}

