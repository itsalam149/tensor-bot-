import { NextRequest, NextResponse } from "next/server";
import { crawlWebsite, pagesToSourceDocuments } from "@/services/crawler";

export async function POST(request: NextRequest) {
    console.log("POST /api/test-crawl HIT");
    try {
        const body = await request.json().catch(() => null);
        const url = body?.url;

        if (!url || typeof url !== "string") {
            return NextResponse.json(
                { success: false, error: "URL is required in the request body." },
                { status: 400 }
            );
        }

        let parsedUrl: URL;
        try {
            parsedUrl = new URL(url);
        } catch {
            return NextResponse.json(
                { success: false, error: "Invalid URL format." },
                { status: 400 }
            );
        }

        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            return NextResponse.json(
                { success: false, error: "Only http and https URLs are allowed." },
                { status: 400 }
            );
        }

        const result = await crawlWebsite(parsedUrl.toString());

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error ?? "Crawl failed." },
                { status: 500 }
            );
        }

        const sampleSourceDocuments = pagesToSourceDocuments({
            pages: result.pages,
            sourceId: "test-source-id",
            botId: "test-bot-id",
        });

        return NextResponse.json({
            success: true,
            pageCount: result.pages.length,
            samplePage: result.pages[0] ?? null,
            sampleDocument: sampleSourceDocuments[0] ?? null,
        });
    } catch (error: any) {
        console.error("Crawl API Route Error:", error);

        return NextResponse.json(
            {
                success: false,
                error: error?.message || "An unexpected error occurred.",
            },
            { status: 500 }
        );
    }
}