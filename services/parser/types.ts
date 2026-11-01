export type SupportedFileType = "pdf" | "docx" | "txt";

export interface ParsedDocument {
    title: string;
    content: string;
    metadata: {
        fileName: string;
        fileType: SupportedFileType;
        mimeType?: string;
    };
}

export class UnsupportedFileTypeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UnsupportedFileTypeError";
    }
}