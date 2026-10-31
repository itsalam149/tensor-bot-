import type { CrawledPage } from "../crawler/types";
import type { ParsedDocument } from "../parser/types";
import type { NormalizedDocument } from "./types";

function cleanText(text: string): string {
    return text
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

export function normalizeCrawledPages(
    pages: CrawledPage[],
    botId: string,
    sourceId: string
): NormalizedDocument[] {
    const crawledAt = new Date().toISOString();

    return pages
        .map((page) => ({
            botId,
            sourceId,
            origin: "crawler" as const,
            title: (page.title || page.url).trim(),
            content: cleanText(page.markdown),
            metadata: {
                url: page.url,
                sourceType: "website",
                crawledAt,
            },
        }))
        .filter((page) => page.content.length > 0);
}

export function normalizeParsedDocuments(
    documentOrDocuments: ParsedDocument | ParsedDocument[],
    botId: string,
    sourceId: string
): NormalizedDocument[] {
    const list = Array.isArray(documentOrDocuments)
        ? documentOrDocuments
        : [documentOrDocuments];

    return list
        .map((document) => ({
            botId,
            sourceId,
            origin: "parser" as const,
            title: document.title.trim(),
            content: cleanText(document.content),
            metadata: {
                ...document.metadata,
                sourceType: document.metadata.fileType,
            },
        }))
        .filter((document) => document.content.length > 0);
}