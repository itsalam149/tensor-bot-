import { GoogleGenAI } from "@google/genai";

const CHAT_MODEL = "gemini-3.8-flash";

export type RetrievedChunk = {
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
};

export type GenerateAnswerInput = {
  botName: string;
  question: string;
  chunks: RetrievedChunk[];
  mekoContext?: string[];
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

function buildContextBlock(chunks: RetrievedChunk[], mekoContext: string[] = []): string {
  if (chunks.length === 0) return "(no relevant context found)";

  const vectorContext = chunks
    .map((chunk, i) => `[${i + 1}] ${chunk.content}`)
    .join("\n\n");
  return [...mekoContext.map((item) => `[Meko memory] ${item}`), vectorContext].join("\n\n");
}

function cleanChunkText(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[\s*View Details\s*→\s*\]\([^)]+\)/gi, "")
    .replace(/View Details\s*→/gi, "")
    .replace(/\]\([^)]+\)/g, "")
    .replace(/\[/g, "")
    .replace(/#{1,6}\s*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function generateAnswer(
  input: GenerateAnswerInput,
  apiKey?: string
): Promise<GenerateAnswerOutput> {
  const qClean = input.question.trim().toLowerCase();
  const isGreeting = /^(hi|hey|hello|good (morning|afternoon|evening)|yo|hola|greetings|howdy)(\s+there|\s+bot)?$/i.test(qClean);

  if (isGreeting) {
    return {
      answer: `Hello! Welcome to ${input.botName}. How can I help you today? Feel free to ask about our menu items, signature platters, curries, late-night hours, or location!`,
      usedChunkCount: 0,
    };
  }

  const key = apiKey ?? process.env.GEMINI_API_KEY;

  if (key) {
    try {
      const client = new GoogleGenAI({ apiKey: key });

      const contextBlock = buildContextBlock(input.chunks, input.mekoContext);
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

      if (response.text?.trim()) {
        return {
          answer: response.text.trim(),
          usedChunkCount: input.chunks.length,
        };
      }
    } catch (err) {
      console.warn("Gemini call failed, falling back to grounded chunk synthesis:", err);
    }
  }

  // Grounded Conversational RAG Synthesis fallback if LLM API credits are depleted
  const allContext = [
    ...(input.mekoContext ?? []),
    ...input.chunks.map((c) => c.content),
  ];

  if (allContext.length > 0) {
    const questionLower = input.question.toLowerCase();
    const words = questionLower
      .split(/\s+/)
      .map((w) => w.replace(/[^a-z0-9]/g, ""))
      .filter((w) => w.length >= 3);

    const sortedContext = [...allContext].sort((a, b) => {
      const textA = a.toLowerCase();
      const textB = b.toLowerCase();
      const scoreA = words.reduce((acc, w) => acc + (textA.includes(w) ? 3 : 0), 0);
      const scoreB = words.reduce((acc, w) => acc + (textB.includes(w) ? 3 : 0), 0);
      return scoreB - scoreA;
    });

    const relevant = sortedContext
      .slice(0, 2)
      .map((c) => cleanChunkText(c))
      .filter(Boolean)
      .join("\n\n---\n\n");

    const answer = relevant
      ? `Here is the information from our menu and details:\n\n${relevant}\n\nWould you like more details, or need help placing an order?`
      : `Hello! I am ${input.botName}. How can I assist you with our menu, specials, or hours today?`;

    return {
      answer,
      usedChunkCount: allContext.length,
    };
  }

  return {
    answer: `Hello! I am ${input.botName}. How can I assist you today?`,
    usedChunkCount: 0,
  };
}
