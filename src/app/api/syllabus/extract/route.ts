import { NextRequest, NextResponse } from "next/server";
import { parseSyllabusText } from "@/lib/syllabus/parser";
import { extractText } from "unpdf";

export const maxDuration = 60; // Allow sufficient serverless execution time for large PDFs

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Limit check (e.g. 20MB)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds maximum size of 20MB." }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();

    let fullText = "";
    let totalPages = 1;

    try {
      const result = await extractText(arrayBuffer, { mergePages: true });
      fullText = result.text || "";
      totalPages = result.totalPages || 1;
    } catch (parseErr: unknown) {
      console.warn("Direct unpdf extraction warning:", parseErr);
      return NextResponse.json({
        success: true,
        isScannedOrImage: true,
        detectedSubjects: [],
        topics: [],
        rawTextPreview: "",
      });
    }

    const extractionResult = parseSyllabusText(fullText);

    return NextResponse.json({
      success: true,
      numPages: totalPages,
      fullExtractedText: fullText,
      ...extractionResult,
    });
  } catch (error: unknown) {
    console.error("PDF Extraction Server Error:", error);
    const message = error instanceof Error ? error.message : "Failed to extract syllabus from PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
