import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { CrawlResult, CrawledFile, CrawledPage } from "./types";
import { normalizeUrl } from "../utils/crawler";

export async function crawlWebsite(urlInput: string): Promise<CrawlResult> {
    try {
        const url = normalizeUrl(urlInput);
        console.log(`[CRAWLER] Starting local crawl: ${url}`);

        const origin = new URL(url).origin;
        const discoveredUrls = await discoverUrls(url, origin);
        const pages: CrawledPage[] = [];
        const files: CrawledFile[] = [];
        const seen = new Set<string>();

        for (const candidate of discoveredUrls) {
            if (seen.has(candidate)) continue;
            seen.add(candidate);
            const response = await fetch(candidate, {
            headers: {
                "User-Agent": "TensorBot-Crawler/1.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5"
            },
            signal: AbortSignal.timeout(15000), // 15 second timeout
            });

            if (!response.ok) continue;
            const contentType = response.headers.get("content-type") ?? "";
            if (contentType.includes("application/pdf") || candidate.toLowerCase().endsWith(".pdf")) {
                files.push({ url: candidate, fileName: fileNameFromUrl(candidate), mimeType: "application/pdf", buffer: Buffer.from(await response.arrayBuffer()) });
                continue;
            }

            const html = await response.text();
            const $ = cheerio.load(html);
            $('script, style, noscript, svg, nav, footer, header, aside, .sidebar').remove();
            const title = $('title').text() || candidate;
            const contentHtml = $('main').html() || $('article').html() || $('body').html() || '';
            const turndownService = new TurndownService({ headingStyle: 'atx' });
            let markdown = "";
            try {
                markdown = turndownService.turndown(contentHtml);
            } catch {
                markdown = $('body').text().replace(/\s+/g, ' ').trim();
            }
            pages.push({ url: candidate, title: title.trim(), markdown: markdown.trim(), sourceType: "website" });

            for (const link of $("a[href]").map((_, element) => $(element).attr("href")).get()) {
                if (!link) continue;
                const linked = new URL(link, candidate);
                if (linked.origin === origin && linked.pathname.toLowerCase().endsWith(".pdf")) {
                    discoveredUrls.push(linked.toString());
                }
            }
        }
        console.log(`[CRAWLER] Completed crawl: ${url} (${pages.length} pages, ${files.length} PDFs)`);
        
        return {
            success: true,
            pages,
            files,
        };
    } catch (error) {
        console.error(`[CRAWLER] Error crawling ${urlInput}:`, error);
        return {
            success: false,
            pages: [],
            files: [],
            error: error instanceof Error ? error.message : "Local crawl failed",
        };
    }
}

async function discoverUrls(startUrl: string, origin: string): Promise<string[]> {
    const urls = [startUrl];
    const sitemapCandidates = [`${origin}/sitemap.xml`];
    try {
        const robots = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(5000) });
        const text = await robots.text();
        sitemapCandidates.push(...text.split("\n").filter((line) => line.toLowerCase().startsWith("sitemap:")).map((line) => line.slice(8).trim()));
    } catch { /* robots.txt is optional */ }

    for (const sitemapUrl of [...new Set(sitemapCandidates)]) {
        try {
            const response = await fetch(sitemapUrl, { signal: AbortSignal.timeout(5000) });
            if (!response.ok) continue;
            const xml = await response.text();
            const sitemapUrls = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((match) => match[1].trim());
            urls.push(...sitemapUrls.filter((candidate) => new URL(candidate).origin === origin));
        } catch { /* missing or malformed sitemaps are optional */ }
    }
    return [...new Set(urls)].slice(0, Number(process.env.CRAWL_MAX_PAGES ?? 20));
}

function fileNameFromUrl(url: string) {
    return decodeURIComponent(new URL(url).pathname.split("/").pop() || "discovered-document.pdf");
}
