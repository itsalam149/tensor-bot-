import type { NormalizedDocument } from "./types";

function normalizeBlock(block: string): string {
    return block
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .toLowerCase();
}

function splitBlocks(content: string): string[] {
    return content
        .split(/\n\s*\n+/g)
        .map((block) => block.trim())
        .filter(Boolean);
}

function compressSingle(
    content: string,
    seen: Set<string>
): { content: string; removed: number } {
    const blocks = splitBlocks(content);
    const output: string[] = [];
    let removed = 0;

    for (const block of blocks) {
        const signature = normalizeBlock(block);
        if (!signature) continue;

        if (seen.has(signature)) {
            removed += 1;
            continue;
        }

        seen.add(signature);
        output.push(block);
    }

    return { content: output.join("\n\n").trim(), removed };
}

export type CompressionResult = {
    documents: NormalizedDocument[];
    removedParagraphs: number;
};

export function compressDocuments(
    documents: NormalizedDocument[],
    dedupeAcrossDocuments = true
): CompressionResult {
    const globalSeen = new Set<string>();
    const compressed: NormalizedDocument[] = [];
    let removedParagraphs = 0;

    for (const document of documents) {
        const localSeen = new Set<string>();
        const seen = dedupeAcrossDocuments ? globalSeen : localSeen;
        const result = compressSingle(document.content, seen);

        removedParagraphs += result.removed;

        const cleanedContent = result.content.trim();
        if (!cleanedContent) continue;

        compressed.push({
            ...document,
            content: cleanedContent,
        });
    }

    return {
        documents: compressed,
        removedParagraphs,
    };
}