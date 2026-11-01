import { NextRequest, NextResponse } from "next/server";
import { parseFile } from "@/services/parser";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const file = formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json(
                { success: false, error: "File is required." },
                { status: 400 }
            );
        }

        const fileName = file.name;
        const mimeType = file.type || undefined;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const parsed = await parseFile(buffer, fileName, mimeType);

        return NextResponse.json({
            success: true,
            title: parsed.title,
            contentLength: parsed.content.length,
            metadata: parsed.metadata,
            preview: parsed.content.slice(0, 500),
        });
    } catch (error: any) {
        console.error("Parse API Error:", error);

        return NextResponse.json(
            { success: false, error: error?.message || "Failed to parse file." },
            { status: 500 }
        );
    }
}