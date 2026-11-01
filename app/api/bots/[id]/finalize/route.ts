import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getAuthUserOrAdmin } from "@/lib/supabase/admin";
import { dbGetBotWithSources, dbUpdateBot } from "@/services/db";

async function resolveUser() {
  const current = await getCurrentUser();
  if (current) return current;
  const { user } = await getAuthUserOrAdmin();
  return user;
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: botId } = await params;
  const user = await resolveUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unable to resolve user session." }, { status: 401 });
  }

  try {
    const { bot: existingBot, sources } = await dbGetBotWithSources(botId);

    if (!existingBot) {
      return NextResponse.json({ success: false, error: "Bot not found." }, { status: 404 });
    }

    const hasCompletedSource = (sources ?? []).some((s) => s.status === "completed");
    if (!hasCompletedSource && sources.length > 0) {
      return NextResponse.json(
        { success: false, error: "Add at least one source that finished processing before deploying." },
        { status: 400 }
      );
    }

    const bot = await dbUpdateBot(botId, { status: "ready" });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || _request.nextUrl.origin || "https://tensor-bot-beta.vercel.app";

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
      embed: {
        scriptSnippet,
        reactSnippet,
        publicId: bot.public_id,
      },
      snippets: {
        script: scriptSnippet,
        react: reactSnippet,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
