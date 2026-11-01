import { parsePdf } from "./pdf";
import { parseDocx } from "./docx";
import { parseTxt } from "./txt";
import {
    ParsedDocument,
    SupportedFileType,
    UnsupportedFileTypeError,
} from "./types";

function getExtension(fileName: string): SupportedFileType {
    const ext = fileName.split(".").pop()?.toLowerCase();

    if (ext === "pdf" || ext === "docx" || ext === "txt") {
        return ext;
    }

    throw new UnsupportedFileTypeError(
        `Unsupported file type: ${ext ?? "unknown"}`
    );
}

export async function parseFile(
    buffer: Buffer,
    fileName: string,
    mimeType?: string
): Promise<ParsedDocument> {
    const type = getExtension(fileName);

    switch (type) {
        case "pdf":
            return parsePdf(buffer, fileName);

        case "docx":
            return parseDocx(buffer, fileName);

        case "txt":
            return parseTxt(buffer, fileName);

        default:
            throw new UnsupportedFileTypeError(`Unsupported file type: ${type}`);
    }
}