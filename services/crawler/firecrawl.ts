import * as cheerio from "cheerio";
import TurndownService from "turndown";
import { CrawlResult, CrawledPage } from "./types";
import { extractBrandFromHtml } from "./brand-extractor";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

function isIgnoredUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes("privacy-policy") ||
    lower.includes("terms-of-service") ||
    lower.includes("terms-and-conditions") ||
    lower.includes("cookie-policy") ||
    lower.includes("cdn-cgi") ||
    lower.includes("#") ||
    lower.endsWith(".xml") ||
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".svg") ||
    lower.endsWith(".gif")
  );
}

export async function crawlWithFirecrawl(urlInput: string, maxPages = 80): Promise<CrawlResult> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      pages: [],
      files: [],
      error: "FIRECRAWL_API_KEY is not configured.",
    };
  }

  try {
    console.log(`[FIRECRAWL] Mapping domain for ${urlInput}...`);

    // 1. Fetch raw homepage HTML to extract accurate brand colors and typography
    let brand: CrawlResult["brand"];
    try {
      const htmlRes = await fetch(urlInput, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; TensorBot/1.0)" },
        signal: AbortSignal.timeout(10000),
      });
      if (htmlRes.ok) {
        const html = await htmlRes.text();
        brand = await extractBrandFromHtml(html, urlInput);
        console.log(`[FIRECRAWL] Extracted brand colors: primary=${brand.primaryColor}, accent=${brand.accentColor}`);
      }
    } catch (err) {
      console.warn("[FIRECRAWL] Could not extract brand colors from raw HTML:", err);
    }

    // 2. Discover all domain URLs (products, menu items, business info, about, contact, location)
    let discoveredUrls: string[] = [urlInput];

    try {
      const mapRes = await fetch("https://api.firecrawl.dev/v1/map", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: urlInput, limit: 120 }),
        signal: AbortSignal.timeout(15000),
      });

      if (mapRes.ok) {
        const mapData = await mapRes.json();
        if (mapData.success && Array.isArray(mapData.links) && mapData.links.length > 0) {
          const valid = (mapData.links as string[])
            .filter((link) => !isIgnoredUrl(link))
            .slice(0, maxPages);

          const unique = Array.from(new Set([urlInput, ...valid]));
          discoveredUrls = unique.slice(0, maxPages);
          console.log(`[FIRECRAWL] Discovered ${discoveredUrls.length} pages (products, categories, business info)`);
        }
      }
    } catch (err) {
      console.warn("[FIRECRAWL] Map endpoint failed, using base URL:", err);
    }

    // 3. Concurrently scrape all discovered URLs in parallel batches
    const pages: CrawledPage[] = [];
    const batchSize = 15;

    console.log(`[FIRECRAWL] Scraping ${discoveredUrls.length} pages in concurrent batches of ${batchSize}...`);

    for (let i = 0; i < discoveredUrls.length; i += batchSize) {
      const batch = discoveredUrls.slice(i, i + batchSize);
      const batchPromises = batch.map(async (url): Promise<CrawledPage | null> => {
        try {
          const res = await fetch(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; TensorBot/1.0)",
              Accept: "text/html,application/xhtml+xml",
            },
            signal: AbortSignal.timeout(12000),
          });

          if (!res.ok) return null;
          const html = await res.text();
          const $ = cheerio.load(html);

          // Clean up noise
          $("script, style, noscript, svg, nav, footer, header, aside, .sidebar, iframe").remove();

          const title =
            $("title").text().trim() ||
            $("h1").first().text().trim() ||
            $('meta[property="og:title"]').attr("content")?.trim() ||
            url;

          const contentHtml = $("main").html() || $("article").html() || $("body").html() || "";
          let markdown = "";
          try {
            markdown = turndown.turndown(contentHtml);
          } catch {
            markdown = $("body").text().replace(/\s+/g, " ").trim();
          }

          if (!markdown.trim() || markdown.trim().length < 20) return null;

          return {
            url,
            title: title.replace(/\s+/g, " ").trim(),
            markdown: markdown.trim(),
            sourceType: "website",
          };
        } catch {
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      pages.push(...batchResults.filter((p): p is CrawledPage => p !== null));
    }

    console.log(`[FIRECRAWL] Successfully scraped ${pages.length} total pages with full product & business details.`);

    return {
      success: pages.length > 0,
      pages,
      files: [],
      brand,
    };
  } catch (error) {
    console.error("[FIRECRAWL] Full crawl failed:", error);
    return {
      success: false,
      pages: [],
      files: [],
      error: error instanceof Error ? error.message : "Firecrawl crawl failed",
    };
  }
}
