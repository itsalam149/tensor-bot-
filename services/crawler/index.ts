import { crawlWithFirecrawl } from "./firecrawl";
import { crawlWebsite as localCrawl } from "./local";
import { CrawlResult } from "./types";

export async function crawlWebsite(url: string): Promise<CrawlResult> {
  if (process.env.FIRECRAWL_API_KEY) {
    const firecrawlResult = await crawlWithFirecrawl(url);
    if (firecrawlResult.success && firecrawlResult.pages.length > 0) {
      return firecrawlResult;
    }
    console.warn("[CRAWLER] Firecrawl was not successful, falling back to local crawler...");
  }
  return localCrawl(url);
}

export * from "./types";
export { pagesToSourceDocuments } from "./transformer";
