import { NextRequest, NextResponse } from "next/server";
import { parseSyllabusText } from "@/lib/syllabus/parser";
import { extractText } from "unpdf";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();

    // unpdf extracts text in modern Next.js / Serverless environments without workers
    const { text, totalPages } = await extractText(arrayBuffer, { mergePages: true });
    const fullText = text || "";

    const extractionResult = parseSyllabusText(fullText);

    return NextResponse.json({
      success: true,
      numPages: totalPages,
      ...extractionResult,
    });
  } catch (error: unknown) {
    console.error("PDF Extraction Error:", error);
    const message = error instanceof Error ? error.message : "Failed to extract syllabus from PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
