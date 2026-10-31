import type { ParsedDocument } from "./types";

function cleanText(text: string): string {
    return text
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

export async function parseTxt(
    buffer: Buffer,
    fileName: string
): Promise<ParsedDocument> {
    const content = cleanText(buffer.toString("utf-8"));

    return {
        title: fileName.replace(/\.txt$/i, ""),
        content,
        metadata: {
            fileName,
            fileType: "txt",
            mimeType: "text/plain",
        },
    };
}