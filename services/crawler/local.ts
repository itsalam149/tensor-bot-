import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { CrawlResult, CrawledPage } from "./types";
import { normalizeUrl } from "../utils/crawler";

export async function crawlWebsite(urlInput: string): Promise<CrawlResult> {
    try {
        const url = normalizeUrl(urlInput);
        console.log(`[CRAWLER] Starting local crawl: ${url}`);
        
        const response = await fetch(url, {
            headers: {
                "User-Agent": "TensorBot-Crawler/1.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5"
            },
            signal: AbortSignal.timeout(15000), // 15 second timeout
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch page. Status: ${response.status}`);
        }
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Clean up unnecessary elements
        $('script, style, noscript, svg, nav, footer, header, aside, .sidebar').remove();
        
        const title = $('title').text() || url;
        
        // Try to get main content area, fallback to body
        let contentHtml = $('main').html() || $('article').html() || $('body').html() || '';
        
        const turndownService = new TurndownService({ headingStyle: 'atx' });
        // Turndown sometimes throws on complex invalid HTML, wrap in try/catch just in case
        let markdown = "";
        try {
            markdown = turndownService.turndown(contentHtml);
        } catch (e) {
            console.error("Turndown failed, falling back to raw text", e);
            markdown = $('body').text().replace(/\s+/g, ' ').trim();
        }
        
        const pages: CrawledPage[] = [
            {
                url,
                title: title.trim(),
                markdown: markdown.trim(),
            }
        ];
        
        console.log(`[CRAWLER] Completed crawl: ${url} (1 page)`);
        
        return {
            success: true,
            pages,
        };
    } catch (error) {
        console.error(`[CRAWLER] Error crawling ${urlInput}:`, error);
        return {
            success: false,
            pages: [],
            error: error instanceof Error ? error.message : "Local crawl failed",
        };
    }
}
