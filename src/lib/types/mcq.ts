export type ExamPattern = "usmle" | "uhs" | "fcps";

export interface McqOption {
  id: string; // "A", "B", "C", "D", "E"
  text: string;
  isCorrect: boolean;
  explanation: string; // Explains why this specific option is correct or incorrect
}

export interface GeneratedMCQ {
  id: string;
  topic: string;
  examPattern: ExamPattern;
  questionStem: string;
  options: McqOption[];
  correctOptionId: string;
  highYieldPearls: string[];
  mnemonic?: string;
  subject?: string;
}

export interface GenerateMcqRequest {
  topic: string;
  examPattern: ExamPattern;
  count: number;
  apiKey?: string;
  aiProvider?: "gemini" | "openai";
}
