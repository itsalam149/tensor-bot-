import https from "https";

export type MekoContext = {
  enabled: boolean;
  recalled: string[];
  stored: string[];
  error?: string;
};

function configured(): boolean {
  return Boolean(process.env.MEKO_API_KEY && process.env.MEKO_MCP_URL);
}

// Ensure string is a valid UUID format for Meko
function toUuid(id: string): string {
  const clean = id.replace(/[^0-9a-fA-F]/g, "").padEnd(32, "0").slice(0, 32);
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20, 32)}`;
}

function callMekoRpc(method: string, params: Record<string, unknown> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      jsonrpc: "2.0",
      id: crypto.randomUUID(),
      method,
      params,
    });

    try {
      const parsedUrl = new URL(process.env.MEKO_MCP_URL!);

      const req = https.request(
        {
          protocol: parsedUrl.protocol,
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || 443,
          path: parsedUrl.pathname + parsedUrl.search,
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.MEKO_API_KEY}`,
            "Content-Type": "application/json",
            Accept: "application/json, text/event-stream",
            "Content-Length": Buffer.byteLength(data),
          },
          timeout: 8000,
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => {
            body += chunk;
          });
          res.on("end", () => {
            try {
              let jsonString = body;
              if (body.includes("data:")) {
                const line = body.split("\n").find((l) => l.startsWith("data:"));
                if (line) {
                  jsonString = line.replace(/^data:\s*/, "").trim();
                }
              }
              const payload = JSON.parse(jsonString);
              if (payload.error) {
                return reject(new Error(payload.error.message ?? "Meko returned an error."));
              }
              resolve(payload.result);
            } catch (err) {
              reject(err);
            }
          });
        }
      );

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Meko request timed out"));
      });

      req.on("error", (err) => {
        reject(err);
      });

      req.write(data);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function recallMekoContext(input: {
  botId: string;
  question: string;
}): Promise<MekoContext> {
  if (!configured()) return { enabled: false, recalled: [], stored: [] };

  try {
    const conversationId = toUuid(input.botId);
    const result = await callMekoRpc("tools/call", {
      name: "memory_search",
      arguments: {
        conversation_id: conversationId,
        query: input.question,
      },
    });

    if (result?.isError) {
      const errorText = result.content?.[0]?.text ?? "Unknown Meko error";
      return { enabled: true, recalled: [], stored: [], error: errorText };
    }

    const rawJson = result?.content?.[0]?.text ?? "{}";
    const parsed = JSON.parse(rawJson) as { results?: Array<{ memory?: string }> };
    const recalledMemories = (parsed.results ?? [])
      .map((item) => item.memory?.trim() ?? "")
      .filter(
        (m) =>
          Boolean(m) &&
          !m.startsWith("Question: ") &&
          !m.includes("How can I assist you today?") &&
          !m.includes("How can I help you today?")
      );

    return {
      enabled: true,
      recalled: recalledMemories,
      stored: [],
    };
  } catch (error) {
    return {
      enabled: true,
      recalled: [],
      stored: [],
      error: error instanceof Error ? error.message : "Meko recall failed.",
    };
  }
}

export async function storeMekoContext(input: {
  botId: string;
  kind: "ingestion" | "answer";
  content: string;
}): Promise<Pick<MekoContext, "enabled" | "stored" | "error">> {
  if (!configured()) return { enabled: false, stored: [] };

  // Never persist low-confidence fallback greetings
  if (
    input.content.includes("How can I assist you today?") ||
    input.content.includes("How can I help you today?")
  ) {
    return { enabled: true, stored: [] };
  }

  try {
    const conversationId = toUuid(input.botId);
    const textToStore = input.content.slice(0, 500); // keep memory units concise

    const result = await callMekoRpc("tools/call", {
      name: "memory_add",
      arguments: {
        conversation_id: conversationId,
        text: textToStore,
      },
    });

    if (result?.isError) {
      const errorText = result.content?.[0]?.text ?? "Unknown Meko error";
      return { enabled: true, stored: [], error: errorText };
    }

    return { enabled: true, stored: [textToStore] };
  } catch (error) {
    return { enabled: true, stored: [], error: error instanceof Error ? error.message : "Meko store failed." };
  }
}
