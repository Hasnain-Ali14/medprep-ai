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

    // Dynamic import to prevent client bundling
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
    const pdfDocument = await loadingTask.promise;

    let fullText = "";
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? (item as { str: string }).str : ""))
        .join(" ");
      fullText += pageText + "\n";
    }

    const extractionResult = parseSyllabusText(fullText);

    return NextResponse.json({
      success: true,
      numPages: pdfDocument.numPages,
      ...extractionResult,
    });
  } catch (error: unknown) {
    console.error("PDF Extraction Error:", error);
    const message = error instanceof Error ? error.message : "Failed to extract syllabus from PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
