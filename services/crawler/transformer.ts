import { CrawledPage, SourceDocument } from "./types";

type TransformInput = {
    pages: CrawledPage[];
    sourceId: string;
    botId: string;
};

export function pagesToSourceDocuments({
    pages,
    sourceId,
    botId,
}: TransformInput): SourceDocument[] {
    const crawledAt = new Date().toISOString();

    return pages
        .filter((page) => page.markdown.trim().length > 0)
        .map((page) => ({
            sourceId,
            botId,
            title: page.title?.trim() || page.url,
            content: page.markdown.trim(),
            metadata: {
                url: page.url,
                sourceType: "website",
                crawledAt,
            },
        }));
}