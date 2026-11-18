import { NextRequest, NextResponse } from "next/server";
import { parseSyllabusText } from "@/lib/syllabus/parser";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Modern pdf-parse v2+ class API
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PDFParse } = require("pdf-parse");
    const parserInstance = new PDFParse({ data: buffer });
    const textResult = await parserInstance.getText();
    const fullText = (typeof textResult === "string" ? textResult : textResult?.text) || "";

    const extractionResult = parseSyllabusText(fullText);

    return NextResponse.json({
      success: true,
      ...extractionResult,
    });
  } catch (error: unknown) {
    console.error("PDF Extraction Error:", error);
    const message = error instanceof Error ? error.message : "Failed to extract syllabus from PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
