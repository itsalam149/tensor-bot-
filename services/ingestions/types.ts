import type { CrawledPage } from "../crawler/types";
import type { ParsedDocument } from "../parser/types";

export type SourceOrigin = "crawler" | "parser";

export type IngestionInput = {
    botId: string;
    sourceId: string;
    crawledPages?: CrawledPage[];
    parsedDocument?: ParsedDocument | ParsedDocument[];
    dedupeAcrossSources?: boolean;
    chunkSize?: number;
    chunkOverlap?: number;
};

export type NormalizedDocument = {
    botId: string;
    sourceId: string;
    origin: SourceOrigin;
    title: string;
    content: string;
    metadata: Record<string, unknown>;
};

export type DocumentChunk = {
    index: number;
    text: string;
};

export type EmbeddedChunkRecord = {
    botId: string;
    sourceId: string;
    origin: SourceOrigin;
    title: string;
    chunkIndex: number;
    chunkText: string;
    embedding: number[];
    metadata: Record<string, unknown>;
    contentHash: string;
};

export type IngestionStats = {
    inputDocuments: number;
    normalizedDocuments: number;
    compressedDocuments: number;
    chunksCreated: number;
    chunksEmbedded: number;
    dedupedParagraphs: number;
};

export type IngestionResult = {
    success: true;
    records: EmbeddedChunkRecord[];
    stats: IngestionStats;
};

export type IngestionFailure = {
    success: false;
    error: string;
};

export type IngestionOutcome = IngestionResult | IngestionFailure;