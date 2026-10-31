import { GoogleGenAI } from "@google/genai";
import type { EmbeddingProvider } from "../ingestions/embedder";

const EMBEDDING_MODEL = "text-embedding-004";
const OUTPUT_DIMENSIONALITY = 768;
const BATCH_SIZE = 32;

/**
 * Embedding provider backed by Gemini's text-embedding-004 model.
 * Requires GEMINI_API_KEY to be set — used server-side only.
 */
export class GeminiEmbeddingProvider implements EmbeddingProvider {
  private client: GoogleGenAI;

  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    this.client = new GoogleGenAI({ apiKey: key });
  }

  async embedMany(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);

      const response = await this.client.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: batch,
        config: { outputDimensionality: OUTPUT_DIMENSIONALITY },
      });

      const embeddings = response.embeddings ?? [];
      for (const embedding of embeddings) {
        results.push(embedding.values ?? []);
      }
    }

    return results;
  }

  async embedQuery(text: string): Promise<number[]> {
    const [vector] = await this.embedMany([text]);
    return vector ?? [];
  }
}
