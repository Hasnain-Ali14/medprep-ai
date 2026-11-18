"use client";

import * as React from "react";
import {
  Sparkles,
  BookOpen,
  Award,
  GraduationCap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  Key,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GeneratedMCQ, ExamPattern } from "@/lib/types/mcq";

export default function MCQGeneratorPage() {
  const [topic, setTopic] = React.useState("Acute Myocardial Infarction");
  const [questionCount, setQuestionCount] = React.useState(5);
  const [examPattern, setExamPattern] = React.useState<ExamPattern>("usmle");
  const [loading, setLoading] = React.useState(false);
  const [mcqs, setMcqs] = React.useState<GeneratedMCQ[]>([]);

  // User Answers & Revealed States
  const [userAnswers, setUserAnswers] = React.useState<Record<string, string>>({});
  const [expandedExplanations, setExpandedExplanations] = React.useState<Record<string, boolean>>({});

  // Optional AI API Key settings
  const [showApiKeyModal, setShowApiKeyModal] = React.useState(false);
  const [apiKey, setApiKey] = React.useState("");
  const [aiProvider, setAiProvider] = React.useState<"gemini" | "openai">("gemini");

  // Load API key from localStorage if saved
  React.useEffect(() => {
    try {
      const storedKey = localStorage.getItem("medprep_ai_key");
      const storedProvider = localStorage.getItem("medprep_ai_provider");
      if (storedKey) setApiKey(storedKey);
      if (storedProvider === "openai" || storedProvider === "gemini") setAiProvider(storedProvider);
    } catch {}
  }, []);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("medprep_ai_key", apiKey.trim());
      localStorage.setItem("medprep_ai_provider", aiProvider);
    } catch {}
    setShowApiKeyModal(false);
  };

  const generateMCQsForPattern = async (patternToUse: ExamPattern) => {
    if (!topic.trim()) {
      alert("Please enter a medical topic first.");
      return;
    }

    setExamPattern(patternToUse);
    setLoading(true);
    setUserAnswers({});
    setExpandedExplanations({});

    try {
      const res = await fetch("/api/mcqs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          examPattern: patternToUse,
          count: questionCount,
          apiKey: apiKey.trim() || undefined,
          aiProvider,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate MCQs");

      setMcqs(data.mcqs || []);
      // Auto-expand explanations for easy reviewing
      const initialExpand: Record<string, boolean> = {};
      (data.mcqs || []).forEach((m: GeneratedMCQ) => {
        initialExpand[m.id] = false;
      });
      setExpandedExplanations(initialExpand);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error generating MCQs");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (mcqId: string, optionId: string) => {
    setUserAnswers((prev) => ({ ...prev, [mcqId]: optionId }));
    // Automatically open explanation when user selects an answer
    setExpandedExplanations((prev) => ({ ...prev, [mcqId]: true }));
  };

  const toggleExplanation = (mcqId: string) => {
    setExpandedExplanations((prev) => ({ ...prev, [mcqId]: !prev[mcqId] }));
  };

  const calculateScore = () => {
    let score = 0;
    mcqs.forEach((mcq) => {
      if (userAnswers[mcq.id] === mcq.correctOptionId) {
        score++;
      }
    });
    return score;
  };

  const attemptedCount = Object.keys(userAnswers).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="MedPrep AI — High-Yield Medical MCQ Generator"
        description="Enter any medical topic and generate board-standard MCQs tailored specifically to USMLE, UHS Undergraduate MBBS, or FCPS Part 1 with exhaustive option-by-option breakdowns, high-yield pearls, and mnemonics."
        badge={<Badge tone="teal">AI Medical Engine</Badge>}
        actions={
          <Button
            onClick={() => setShowApiKeyModal(true)}
            variant="outline"
            className="text-xs h-9 border-slate-200"
          >
            <Key className="mr-1.5 h-3.5 w-3.5 text-[#0d9488]" />
            {apiKey ? "AI API Key Connected" : "Configure AI Key (Optional)"}
          </Button>
        }
      />

      {/* Main Command Center Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-end">
            {/* Topic Input */}
            <div className="lg:col-span-8 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-[#0f2744]" />
                Medical Topic / Pathology / Pharmacology / Clinical Concept:
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Diabetic Ketoacidosis, Mitral Stenosis, Inguinal Hernia, Preeclampsia..."
                className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:border-[#0d9488] focus:outline-none focus:ring-1 focus:ring-[#0d9488]"
              />
            </div>

            {/* Question Count Selector */}
            <div className="lg:col-span-4 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Number of MCQs:
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-[#0d9488] focus:outline-none"
              >
                <option value={3}>3 High-Yield Questions</option>
                <option value={5}>5 Questions (Recommended)</option>
                <option value={10}>10 Questions Mini-Block</option>
                <option value={15}>15 Questions Full-Block</option>
              </select>
            </div>
          </div>

          {/* THREE SEPARATE EXAM PATTERN COMMAND BUTTONS */}
          <div className="border-t border-slate-100 pt-4">
            <span className="text-xs font-semibold text-slate-600 block mb-2.5">
              Select Exam Format &amp; Click to Generate:
            </span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Button 1: USMLE Pattern */}
              <button
                type="button"
                disabled={loading}
                onClick={() => generateMCQsForPattern("usmle")}
                className="group flex flex-col items-start rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 text-left transition-all hover:border-blue-400 hover:bg-blue-50/90 hover:shadow-xs cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <GraduationCap className="h-4 w-4 text-blue-700" />
                  Generate USMLE Pattern
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-blue-800/80">
                  Step 1 &amp; 2 CK vignette style, multi-step clinical reasoning &amp; management.
                </p>
              </button>

              {/* Button 2: UHS Undergraduate Pattern */}
              <button
                type="button"
                disabled={loading}
                onClick={() => generateMCQsForPattern("uhs")}
                className="group flex flex-col items-start rounded-xl border border-teal-200 bg-teal-50/50 p-3.5 text-left transition-all hover:border-teal-400 hover:bg-teal-50/90 hover:shadow-xs cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                  <Award className="h-4 w-4 text-teal-700" />
                  Generate UHS Pattern
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-teal-800/80">
                  Undergraduate MBBS syllabus, gold standards, diagnostic hallmarks &amp; guidelines.
                </p>
              </button>

              {/* Button 3: FCPS Part 1 Pattern */}
              <button
                type="button"
                disabled={loading}
                onClick={() => generateMCQsForPattern("fcps")}
                className="group flex flex-col items-start rounded-xl border border-purple-200 bg-purple-50/50 p-3.5 text-left transition-all hover:border-purple-400 hover:bg-purple-50/90 hover:shadow-xs cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                  <Sparkles className="h-4 w-4 text-purple-700" />
                  Generate FCPS Part 1
                </div>
                <p className="mt-1 text-xs text-purple-800/80 leading-relaxed text-[11px]">
                  CPSP Single Best Answer (SBA), anatomy/path/physio &amp; discriminative choices.
                </p>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading Indicator */}
      {loading && (
        <Card className="border-slate-200 p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#0d9488]" />
            <h3 className="text-sm font-semibold text-slate-800">
              Generating High-Yield Questions for &quot;{topic}&quot;...
            </h3>
            <p className="max-w-md text-xs text-slate-500">
              Formulating clinical vignettes, crafting distractor explanations, synthesizing board pearls, and generating mnemonics.
            </p>
          </div>
        </Card>
      )}

      {/* Generated MCQs Display */}
      {!loading && mcqs.length > 0 && (
        <div className="space-y-6">
          {/* Performance Summary Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between rounded-xl bg-[#0f2744] p-4 text-white gap-3">
            <div>
              <span className="text-xs text-teal-300 font-semibold uppercase tracking-wider">
                Exam Mode: {examPattern.toUpperCase()} Pattern
              </span>
              <h2 className="text-base font-bold">
                {mcqs.length} Questions on &quot;{topic}&quot;
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300">
                Score: <strong className="text-white font-mono text-sm">{calculateScore()} / {attemptedCount}</strong> ({attemptedCount}/{mcqs.length} answered)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserAnswers({})}
                className="bg-transparent text-white border-slate-600 hover:bg-white/10 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset Answers
              </Button>
            </div>
          </div>

          {/* List of Questions */}
          {mcqs.map((mcq, index) => {
            const selectedOption = userAnswers[mcq.id];
            const isAnswered = Boolean(selectedOption);
            const isCorrect = selectedOption === mcq.correctOptionId;
            const isExpanded = expandedExplanations[mcq.id];

            return (
              <Card key={mcq.id} className="border-slate-200 overflow-hidden shadow-xs">
                {/* Question Header */}
                <CardHeader className="bg-slate-50/60 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f2744] text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                    <Badge tone={examPattern === "usmle" ? "navy" : examPattern === "fcps" ? "rose" : "teal"}>
                      {examPattern.toUpperCase()}
                    </Badge>
                  </div>
                  {isAnswered && (
                    <Badge tone={isCorrect ? "emerald" : "rose"}>
                      {isCorrect ? "Correct" : "Incorrect"}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Question Stem */}
                  <p className="text-sm text-slate-900 font-medium leading-relaxed">
                    {mcq.questionStem}
                  </p>

                  {/* Options (A, B, C, D, E) */}
                  <div className="space-y-2 pt-1">
                    {mcq.options.map((opt) => {
                      const isOptionSelected = selectedOption === opt.id;
                      const isOptionTheCorrectOne = opt.id === mcq.correctOptionId;

                      let buttonStyle = "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300";
                      if (isAnswered) {
                        if (isOptionTheCorrectOne) {
                          buttonStyle = "border-emerald-400 bg-emerald-50/90 text-emerald-950 font-medium ring-1 ring-emerald-400";
                        } else if (isOptionSelected && !isOptionTheCorrectOne) {
                          buttonStyle = "border-rose-400 bg-rose-50/90 text-rose-950 ring-1 ring-rose-400";
                        } else {
                          buttonStyle = "border-slate-100 bg-slate-50/50 text-slate-400 opacity-70";
                        }
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(mcq.id, opt.id)}
                          className={`w-full rounded-xl border p-3 text-left text-xs transition-all flex items-start gap-3 cursor-pointer ${buttonStyle}`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-bold text-[11px] ${
                              isAnswered && isOptionTheCorrectOne
                                ? "bg-emerald-600 text-white"
                                : isAnswered && isOptionSelected
                                ? "bg-rose-600 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span className="flex-1 leading-relaxed">{opt.text}</span>
                          {isAnswered && isOptionTheCorrectOne && (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          )}
                          {isAnswered && isOptionSelected && !isOptionTheCorrectOne && (
                            <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Toggle Explanation Accordion Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => toggleExplanation(mcq.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0d9488] hover:text-[#0f766e] transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Hide Detailed Explanations &amp; High-Yield Pearls
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Show Detailed Explanations &amp; High-Yield Pearls
                        </>
                      )}
                    </button>
                  </div>

                  {/* Exhaustive Option-by-Option Breakdown */}
                  {isExpanded && (
                    <div className="space-y-3.5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs">
                      {/* Option-by-Option Analysis */}
                      <div>
                        <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[11px] mb-2 flex items-center gap-1.5">
                          <HelpCircle className="h-3.5 w-3.5 text-[#0f2744]" />
                          Option-By-Option Breakdown:
                        </h4>
                        <div className="space-y-2">
                          {mcq.options.map((opt) => (
                            <div
                              key={opt.id}
                              className={`p-2.5 rounded-lg border leading-relaxed ${
                                opt.isCorrect
                                  ? "border-emerald-200 bg-emerald-50/70 text-emerald-950"
                                  : "border-slate-200 bg-white text-slate-700"
                              }`}
                            >
                              <strong className="font-semibold mr-1">Option {opt.id}:</strong>
                              <span>{opt.explanation}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* High-Yield Exam Pearls */}
                      {mcq.highYieldPearls && mcq.highYieldPearls.length > 0 && (
                        <div className="border-t border-slate-200 pt-3">
                          <h4 className="font-bold text-[#0f2744] uppercase tracking-wide text-[11px] mb-1.5 flex items-center gap-1.5">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                            High-Yield Exam Pearls:
                          </h4>
                          <ul className="list-disc pl-4 space-y-1 text-slate-700">
                            {mcq.highYieldPearls.map((pearl, pIdx) => (
                              <li key={pIdx}>{pearl}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Clinical Mnemonic */}
                      {mcq.mnemonic && (
                        <div className="rounded-lg border border-teal-200 bg-teal-50/80 p-2.5 text-teal-950">
                          <strong className="font-bold block mb-0.5 text-[11px] uppercase tracking-wider text-teal-900">
                            Clinical Mnemonic:
                          </strong>
                          <span>{mcq.mnemonic}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* AI API Key Modal */}
      {showApiKeyModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Key className="h-4 w-4 text-[#0d9488]" />
              AI API Key Configuration
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              MedPrep AI includes a built-in curated medical question bank. To generate unlimited custom real-time questions, you can enter your free Google Gemini or OpenAI API key here.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-700">AI Provider</label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value as "gemini" | "openai")}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-[#0d9488] focus:outline-none"
                >
                  <option value="gemini">Google Gemini (Recommended / Free)</option>
                  <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">API Key</label>
                <input
                  type="password"
                  placeholder="Paste your API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-[#0d9488] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" onClick={() => setShowApiKeyModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#0f2744] text-white">
                  Save Key
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
