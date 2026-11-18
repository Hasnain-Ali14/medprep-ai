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

    // Require CJS export to avoid Turbopack ESM default export mismatch
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    const fullText = data.text || "";

    const extractionResult = parseSyllabusText(fullText);

    return NextResponse.json({
      success: true,
      numPages: data.numpages,
      ...extractionResult,
    });
  } catch (error: unknown) {
    console.error("PDF Extraction Error:", error);
    const message = error instanceof Error ? error.message : "Failed to extract syllabus from PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
