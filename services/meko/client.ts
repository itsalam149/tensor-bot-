type MekoTool = { name?: string; description?: string };

export type MekoContext = {
  enabled: boolean;
  recalled: string[];
  stored: string[];
  error?: string;
};

const DEFAULT_DATAPACK = "tensor-bot-knowledge";

function configured() {
  return Boolean(process.env.MEKO_API_KEY && process.env.MEKO_MCP_URL);
}

async function rpc(method: string, params: Record<string, unknown> = {}) {
  const response = await fetch(process.env.MEKO_MCP_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MEKO_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: crypto.randomUUID(), method, params }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) throw new Error(`Meko request failed with status ${response.status}.`);
  const payload = await response.json() as { result?: unknown; error?: { message?: string } };
  if (payload.error) throw new Error(payload.error.message ?? "Meko returned an error.");
  return payload.result;
}

async function findTool(explicit: string | undefined, aliases: string[]) {
  const result = await rpc("tools/list") as { tools?: MekoTool[] } | undefined;
  const tools = result?.tools ?? [];
  if (explicit && tools.some((tool) => tool.name === explicit)) return explicit;
  const match = tools.find((tool) => {
    const haystack = `${tool.name ?? ""} ${tool.description ?? ""}`.toLowerCase();
    return aliases.some((alias) => haystack.includes(alias));
  });
  return match?.name;
}

async function callTool(name: string, arguments_: Record<string, unknown>) {
  const result = await rpc("tools/call", { name, arguments: arguments_ }) as {
    content?: Array<{ type?: string; text?: string }>;
  } | undefined;
  return (result?.content ?? [])
    .map((part) => part.text ?? "")
    .filter(Boolean)
    .join("\n");
}

export async function recallMekoContext(input: {
  botId: string;
  question: string;
}): Promise<MekoContext> {
  if (!configured()) return { enabled: false, recalled: [], stored: [] };

  try {
    const name = await findTool(process.env.MEKO_RECALL_TOOL, ["recall", "memory", "knowledge"]);
    if (!name) return { enabled: true, recalled: [], stored: [], error: "No Meko recall tool was discovered." };
    const text = await callTool(name, {
      datapack_id: process.env.MEKO_DATAPACK ?? DEFAULT_DATAPACK,
      query: input.question,
      bot_id: input.botId,
      limit: 6,
    });
    return { enabled: true, recalled: text ? [text] : [], stored: [] };
  } catch (error) {
    return { enabled: true, recalled: [], stored: [], error: error instanceof Error ? error.message : "Meko recall failed." };
  }
}

export async function storeMekoContext(input: {
  botId: string;
  kind: "ingestion" | "answer";
  content: string;
}): Promise<Pick<MekoContext, "enabled" | "stored" | "error">> {
  if (!configured()) return { enabled: false, stored: [] };

  try {
    const name = await findTool(process.env.MEKO_WRITE_TOOL, ["write", "note", "datapack", "memory"]);
    if (!name) return { enabled: true, stored: [], error: "No Meko write tool was discovered." };
    const text = await callTool(name, {
      datapack_id: process.env.MEKO_DATAPACK ?? DEFAULT_DATAPACK,
      content: input.content,
      metadata: { bot_id: input.botId, kind: input.kind },
    });
    return { enabled: true, stored: text ? [text] : [input.content] };
  } catch (error) {
    return { enabled: true, stored: [], error: error instanceof Error ? error.message : "Meko write failed." };
  }
}