import { createRequire } from "node:module";
import type { ParsedDocument } from "./types";

const require = createRequire(import.meta.url);
const mammoth = require("mammoth");

function stripHtml(html: string): string {
    return html
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

export async function parseDocx(
    buffer: Buffer,
    fileName: string
): Promise<ParsedDocument> {
    const result = await mammoth.convertToHtml({ buffer });
    const content = stripHtml(result.value || "");

    return {
        title: fileName.replace(/\.docx$/i, ""),
        content,
        metadata: {
            fileName,
            fileType: "docx",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
    };
}