import type { ParsedDocument } from "./types";
import { PDFParse } from 'pdf-parse';

function cleanText(text: string): string {
    return text
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

export async function parsePdf(
    buffer: Buffer,
    fileName: string
): Promise<ParsedDocument> {
    const parser = new PDFParse({ data: buffer });
    try {
        const data = await parser.getText();
        const content = cleanText(data.text || "");

        return {
            title: fileName.replace(/\.pdf$/i, ""),
            content,
            metadata: {
                fileName,
                fileType: "pdf",
                mimeType: "application/pdf",
            },
        };
    } finally {
        await parser.destroy();
    }
}