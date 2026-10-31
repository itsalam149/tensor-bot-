import type { DocumentChunk } from "./types";

export type ChunkOptions = {
    chunkSize?: number;
    chunkOverlap?: number;
};

function splitIntoParagraphs(text: string): string[] {
    return text
        .split(/\n\s*\n+/g)
        .map((part) => part.trim())
        .filter(Boolean);
}

export function chunkText(
    text: string,
    options: ChunkOptions = {}
): DocumentChunk[] {
    const chunkSize = Math.max(300, options.chunkSize ?? 1200);
    const chunkOverlap = Math.max(0, Math.min(options.chunkOverlap ?? 150, chunkSize - 1));

    const paragraphs = splitIntoParagraphs(text);
    const chunks: DocumentChunk[] = [];

    if (paragraphs.length === 0) return chunks;

    let buffer = "";
    let index = 0;

    const pushBuffer = () => {
        const cleaned = buffer.trim();
        if (cleaned) {
            chunks.push({ index, text: cleaned });
            index += 1;
        }
    };

    for (const paragraph of paragraphs) {
        if (!buffer) {
            buffer = paragraph;
            continue;
        }

        if ((buffer + "\n\n" + paragraph).length <= chunkSize) {
            buffer += "\n\n" + paragraph;
            continue;
        }

        pushBuffer();

        if (paragraph.length <= chunkSize) {
            buffer = paragraph;
            continue;
        }

        let start = 0;
        while (start < paragraph.length) {
            const end = Math.min(start + chunkSize, paragraph.length);
            const slice = paragraph.slice(start, end).trim();
            if (slice) {
                chunks.push({ index, text: slice });
                index += 1;
            }
            if (end >= paragraph.length) break;
            start = Math.max(0, end - chunkOverlap);
        }

        buffer = "";
    }

    pushBuffer();
    return chunks;
}