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

const COMMON_MBBS_SUBJECTS = [
  "Medicine",
  "Surgery",
  "Obstetrics",
  "Gynaecology",
  "Pediatrics",
  "Ophthalmology",
  "ENT",
  "Orthopedics",
  "Psychiatry",
  "Dermatology",
  "Pharmacology",
  "Pathology",
  "Microbiology",
  "Forensic Medicine",
  "Community Medicine",
  "Anatomy",
  "Physiology",
  "Biochemistry",
];

/**
 * Intelligent parser that identifies subjects, chapters, and topics from syllabus text.
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

  let currentSubject = "General MBBS";
  let currentChapter = "General Topics";
  const detectedSubjectsSet = new Set<string>();
  const topics: ExtractedTopicItem[] = [];

  for (const line of lines) {
    // Check if line indicates a subject
    const subjectMatch = COMMON_MBBS_SUBJECTS.find((s) =>
      new RegExp(`^(subject\\s*[:\\-]?\\s*)?${s}`, "i").test(line)
    );

    if (subjectMatch) {
      currentSubject = subjectMatch;
      detectedSubjectsSet.add(currentSubject);
      currentChapter = "Introduction";
      continue;
    }

    // Check if line is a chapter / unit
    const chapterMatch = line.match(/^(chapter|unit|section|module|part)\s*(\d+|[ivx]+)?\s*[:.\-]?\s*(.+)/i);
    if (chapterMatch) {
      currentChapter = (chapterMatch[3] || line).substring(0, 80).trim();
      continue;
    }

    // Identify numbered or bulleted topic items
    const topicMatch = line.match(/^(\d+[\.\)]|\-|\*|•|[a-z][\.\)])\s*(.+)/i);
    const candidateName = topicMatch ? topicMatch[2].trim() : (line.length > 8 && line.length < 120 ? line : null);

    if (candidateName && !candidateName.toLowerCase().startsWith("page ") && !candidateName.toLowerCase().includes("syllabus copy")) {
      const isHighPriority = /emergency|shock|management|acute|syndrome|carcinoma|failure|tuberculosis|trauma/i.test(candidateName);
      topics.push({
        id: `topic-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: candidateName,
        chapterName: currentChapter,
        subjectName: currentSubject,
        estimatedMinutes: 60,
        priority: isHighPriority ? "high" : "medium",
      });
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
