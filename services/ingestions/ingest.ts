import { createHash } from "node:crypto";
import type { CrawledPage } from "../crawler/types";
import type { ParsedDocument } from "../parser/types";
import { chunkText } from "./chunker";
import { compressDocuments } from "./compressor";
import type { EmbeddingProvider } from "./embedder";
import { normalizeCrawledPages, normalizeParsedDocuments } from "./normalize";
import type {
    EmbeddedChunkRecord,
    IngestionInput,
    IngestionOutcome,
    NormalizedDocument,
} from "./types";

function assertHasInput(input: IngestionInput): void {
    const hasPages = Array.isArray(input.crawledPages) && input.crawledPages.length > 0;
    const hasParsedDocument = Array.isArray(input.parsedDocument)
        ? input.parsedDocument.length > 0
        : Boolean(input.parsedDocument);

    if (!hasPages && !hasParsedDocument) {
        throw new Error("Provide crawledPages, parsedDocument, or both.");
    }
}

function buildContentHash(text: string): string {
    return createHash("sha256").update(text).digest("hex");
}

function toNormalizedDocuments(input: IngestionInput): NormalizedDocument[] {
    const documents: NormalizedDocument[] = [];

    if (input.crawledPages?.length) {
        documents.push(...normalizeCrawledPages(input.crawledPages, input.botId, input.sourceId));
    }

    if (input.parsedDocument) {
        documents.push(...normalizeParsedDocuments(input.parsedDocument, input.botId, input.sourceId));
    }

    return documents;
}

export async function ingestToEmbeddings(
    input: IngestionInput,
    embedder: EmbeddingProvider
): Promise<IngestionOutcome> {
    try {
        assertHasInput(input);

        const normalizedDocuments = toNormalizedDocuments(input);
        if (normalizedDocuments.length === 0) {
            return {
                success: false,
                error: "No non-empty content was found to ingest.",
            };
        }

        const compression = compressDocuments(normalizedDocuments, input.dedupeAcrossSources ?? true);

        if (compression.documents.length === 0) {
            return {
                success: false,
                error: "All content was removed during compression/deduplication.",
            };
        }

        const records: EmbeddedChunkRecord[] = [];
        let chunksCreated = 0;

        for (const document of compression.documents) {
            const chunks = chunkText(document.content, {
                chunkSize: input.chunkSize,
                chunkOverlap: input.chunkOverlap,
            });

            chunksCreated += chunks.length;
            if (chunks.length === 0) continue;

            const embeddings = await embedder.embedMany(chunks.map((chunk) => chunk.text));

            chunks.forEach((chunk, index) => {
                records.push({
                    botId: document.botId,
                    sourceId: document.sourceId,
                    origin: document.origin,
                    title: document.title,
                    chunkIndex: chunk.index,
                    chunkText: chunk.text,
                    embedding: embeddings[index],
                    metadata: document.metadata,
                    contentHash: buildContentHash(chunk.text),
                });
            });
        }

        return {
            success: true,
            records,
            stats: {
                inputDocuments:
                    (input.crawledPages?.length ?? 0) +
                    (Array.isArray(input.parsedDocument)
                        ? input.parsedDocument.length
                        : input.parsedDocument
                            ? 1
                            : 0),
                normalizedDocuments: normalizedDocuments.length,
                compressedDocuments: compression.documents.length,
                chunksCreated,
                chunksEmbedded: records.length,
                dedupedParagraphs: compression.removedParagraphs,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to ingest content.",
        };
    }
}