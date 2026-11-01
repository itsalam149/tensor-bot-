import { GoogleGenAI } from "@google/genai";
import { MockEmbeddingProvider, type EmbeddingProvider } from "../ingestions/embedder";

const EMBEDDING_MODEL = "gemini-embedding-001";
const OUTPUT_DIMENSIONALITY = 768;
const BATCH_SIZE = 32;

/**
 * Embedding provider backed by Gemini's embedding model with seamless fallback.
 */
export class GeminiEmbeddingProvider implements EmbeddingProvider {
  private client?: GoogleGenAI;
  private mock = new MockEmbeddingProvider();

  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.GEMINI_API_KEY;
    if (key) {
      try {
        this.client = new GoogleGenAI({ apiKey: key });
      } catch {
        // fallback to mock
      }
    }
  }

  async embedMany(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    if (this.client) {
      try {
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
        if (results.length === texts.length) {
          return results;
        }
      } catch (err: any) {
        console.warn("[EMBEDDER] Gemini embedding failed, using deterministic fallback:", err?.message || err);
      }
    }

    return this.mock.embedMany(texts);
  }

  async embedQuery(text: string): Promise<number[]> {
    const [vector] = await this.embedMany([text]);
    return vector ?? [];
  }
}
