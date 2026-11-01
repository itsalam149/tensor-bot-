import { CrawledPage, FirecrawlPage } from "../crawler/types";

export function normalizeUrl(input: string) {
    const url = new URL(input);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Only http and https URLs are allowed.");
    }

    return url.toString();
}

export function mapFirecrawlPages(data: FirecrawlPage[] | undefined, fallbackUrl: string): CrawledPage[] {
    if (!Array.isArray(data)) return [];

    return data
        .map((doc) => {
            const url = doc.url || doc.metadata?.sourceURL || doc.metadata?.url || fallbackUrl;
            const title = doc.metadata?.title || doc.title || url;
            const markdown = doc.markdown || "";

            return {
                url,
                title,
                markdown,
            };
        })
        .filter((page) => page.url && page.markdown !== undefined);
}