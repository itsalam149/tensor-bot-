export interface CrawledPage {
    url: string;
    title: string;
    markdown: string;
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