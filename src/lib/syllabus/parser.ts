export interface ExtractedTopicItem {
  id: string;
  name: string;
  chapterName: string;
  subjectName: string;
  estimatedMinutes: number;
  priority: "low" | "medium" | "high" | "critical";
}

export interface SyllabusExtractionResult {
  isScannedOrImage: boolean;
  totalTextLength: number;
  detectedSubjects: string[];
  topics: ExtractedTopicItem[];
  rawTextPreview: string;
}

// Canonical MBBS / Medical Subjects to match against
const MEDICAL_SUBJECTS_LIST = [
  "Medicine",
  "General Medicine",
  "Surgery",
  "General Surgery",
  "Obstetrics & Gynaecology",
  "Obstetrics and Gynaecology",
  "Obstetrics",
  "Gynaecology",
  "OBG",
  "Pediatrics",
  "Paediatrics",
  "Ophthalmology",
  "ENT",
  "Otorhinolaryngology",
  "Orthopedics",
  "Orthopaedics",
  "Psychiatry",
  "Dermatology",
  "Pharmacology",
  "Pathology",
  "Microbiology",
  "Forensic Medicine",
  "Community Medicine",
  "PSM",
  "Anatomy",
  "Physiology",
  "Biochemistry",
  "Anesthesiology",
  "Radiology",
];

// Noise phrases commonly found in university PDF headers/footers to ignore
const JUNK_PHRASES = [
  "university",
  "examination",
  "syllabus copy",
  "page ",
  "all rights reserved",
  "curriculum",
  "scheme of examination",
  "marks distribution",
  "internal assessment",
  "practical exam",
  "theory hours",
  "viva voce",
  "regulations",
  "course outcome",
  "learning objective",
  "reference book",
  "prescribed text",
  "duration of exam",
  "minimum pass marks",
  "table of contents",
  "index",
  "department of",
  "guidelines for",
];

/**
 * Clean & strictly structured Subject-Wise parser.
 * Only extracts actual topics grouped directly under their respective detected subject.
 */
export function parseSyllabusText(text: string): SyllabusExtractionResult {
  const trimmed = text.trim();
  const isScanned = trimmed.length < 50;

  if (isScanned) {
    return {
      isScannedOrImage: true,
      totalTextLength: trimmed.length,
      detectedSubjects: [],
      topics: [],
      rawTextPreview: trimmed,
    };
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let currentSubject: string | null = null;
  let currentChapter = "Core Topics";
  const detectedSubjectsSet = new Set<string>();
  const topics: ExtractedTopicItem[] = [];

  for (const rawLine of lines) {
    const lower = rawLine.toLowerCase();

    // 1. Skip obvious boilerplates, headers, page numbers, and marks schemes
    if (JUNK_PHRASES.some((junk) => lower.includes(junk)) && !lower.includes("management")) {
      continue;
    }

    // Skip short numbers, dates, or symbols
    if (/^(\d+|[ivxlcdm]+|\W+)$/i.test(rawLine)) {
      continue;
    }

    // 2. Detect Subject Header
    const matchedSubject = MEDICAL_SUBJECTS_LIST.find((subj) => {
      const pattern = new RegExp(`^(subject\\s*[:\\-]?\\s*|paper\\s*[ivx0-9]+\\s*[:\\-]?\\s*)?${subj}\\b`, "i");
      return pattern.test(rawLine) || rawLine.toLowerCase() === subj.toLowerCase();
    });

    if (matchedSubject) {
      currentSubject = matchedSubject;
      detectedSubjectsSet.add(currentSubject);
      currentChapter = "Core Topics";
      continue;
    }

    // If we haven't encountered an official subject heading yet, ignore miscellaneous preamble text
    if (!currentSubject) {
      continue;
    }

    // 3. Detect Chapter / System / Unit headings
    const chapterMatch = rawLine.match(/^(chapter|unit|section|system|module|block)\s*(\d+|[ivx]+)?\s*[:.\-]?\s*(.+)/i);
    if (chapterMatch) {
      currentChapter = (chapterMatch[3] || rawLine).substring(0, 70).trim();
      continue;
    }

    // 4. Extract Real Topics under the Active Subject
    // Matches bullet points, numbers (e.g. 1., 1), a., a)), or clean standalone medical topics
    const bulletMatch = rawLine.match(/^(\d+[\.\)]|\-|\*|•|[a-z][\.\)])\s*(.+)/i);
    const candidateTopic = bulletMatch ? bulletMatch[2].trim() : (rawLine.length >= 5 && rawLine.length <= 130 ? rawLine : null);

    if (candidateTopic && candidateTopic.length > 3) {
      // Avoid adding headings as topics if they end with colons or are just punctuation
      if (candidateTopic.endsWith(":") || candidateTopic.startsWith("(") && candidateTopic.endsWith(")")) {
        continue;
      }

      // Detect clinical priority
      const isCritical = /emergency|shock|acute|infarction|carcinoma|haemorrhage|trauma|failure|arrest|coma|sepsis|poisoning/i.test(candidateTopic);
      const isHigh = /management|diagnosis|treatment|protocol|disorder|syndrome|tuberculosis|fever|infection/i.test(candidateTopic);

      topics.push({
        id: `topic-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: candidateTopic,
        chapterName: currentChapter,
        subjectName: currentSubject,
        estimatedMinutes: 60,
        priority: isCritical ? "critical" : isHigh ? "high" : "medium",
      });
    }
  }

  // Fallback: If no strict subject headers were recognized in document, assign to "General Medical Syllabus"
  if (topics.length === 0 && lines.length > 5) {
    const fallbackSubject = "Medical Syllabus";
    detectedSubjectsSet.add(fallbackSubject);
    for (const rawLine of lines) {
      if (rawLine.length > 10 && rawLine.length < 120 && !JUNK_PHRASES.some((j) => rawLine.toLowerCase().includes(j))) {
        topics.push({
          id: `topic-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: rawLine,
          chapterName: "Core Topics",
          subjectName: fallbackSubject,
          estimatedMinutes: 60,
          priority: "medium",
        });
      }
    }
  }

  return {
    isScannedOrImage: topics.length === 0 && trimmed.length < 200,
    totalTextLength: trimmed.length,
    detectedSubjects: Array.from(detectedSubjectsSet),
    topics,
    rawTextPreview: trimmed.substring(0, 1000),
  };
}
