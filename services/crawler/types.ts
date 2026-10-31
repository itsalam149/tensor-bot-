export interface CrawledPage {
    url: string;
    title: string;
    markdown: string;
    sourceType?: "website" | "pdf";
}

export interface CrawledFile {
    url: string;
    fileName: string;
    mimeType: string;
    buffer: Buffer;
}

export interface SourceDocument {
    sourceId: string;
    botId: string;
    title: string;
    content: string;
    metadata: {
        url: string;
        sourceType: "website";
        crawledAt: string;
    };
}

export interface CrawlResult {
    success: boolean;
    pages: CrawledPage[];
    files: CrawledFile[];
    error?: string;
}

export interface FirecrawlPage {
    url?: string;
    markdown?: string;
    title?: string;
    metadata?: {
        title?: string;
        sourceURL?: string;
        url?: string;
        [key: string]: unknown;
    };
}