import { GoogleGenAI } from "@google/genai";

const CHAT_MODEL = "gemini-2.5-flash";

export type RetrievedChunk = {
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
};

export type GenerateAnswerInput = {
  botName: string;
  question: string;
  chunks: RetrievedChunk[];
  history?: { role: "user" | "assistant"; content: string }[];
};

export type GenerateAnswerOutput = {
  answer: string;
  usedChunkCount: number;
};

function buildSystemPrompt(botName: string): string {
  return [
    `You are ${botName}, a customer support assistant answering questions about a specific business.`,
    "Only use the CONTEXT provided below to answer. If the context does not contain the answer, say you don't have that information and offer to connect the visitor with a human.",
    "Be concise, friendly, and accurate. Do not make up prices, stock levels, or policies that are not in the context.",
  ].join(" ");
}

function buildContextBlock(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "(no relevant context found)";

  return chunks
    .map((chunk, i) => `[${i + 1}] ${chunk.content}`)
    .join("\n\n");
}

/**
 * Generates a grounded answer using Gemini. Requires GEMINI_API_KEY.
 * For live-data questions (order status, stock, etc.) this should be
 * extended with function/tool calling against the bot owner's API —
 * see docs/PRODUCT_ROADMAP.md, Phase 2.
 */
export async function generateAnswer(
  input: GenerateAnswerInput,
  apiKey?: string
): Promise<GenerateAnswerOutput> {
  const key = apiKey ?? process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const client = new GoogleGenAI({ apiKey: key });

  const contextBlock = buildContextBlock(input.chunks);
  const historyText = (input.history ?? [])
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Visitor" : "Assistant"}: ${m.content}`)
    .join("\n");

  const prompt = [
    historyText ? `CONVERSATION SO FAR:\n${historyText}\n` : "",
    `CONTEXT:\n${contextBlock}`,
    `QUESTION:\n${input.question}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await client.models.generateContent({
    model: CHAT_MODEL,
    contents: prompt,
    config: {
      systemInstruction: buildSystemPrompt(input.botName),
      temperature: 0.3,
    },
  });

  return {
    answer: response.text ?? "I'm not sure — could you rephrase that?",
    usedChunkCount: input.chunks.length,
  };
}
