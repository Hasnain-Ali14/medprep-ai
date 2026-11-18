"use client";

import * as React from "react";
import {
  BookOpen,
  Plus,
  FileUp,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Circle,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { TopicStatus, PriorityLevel } from "@/lib/types/domain";
import type { ExtractedTopicItem } from "@/lib/syllabus/parser";

export interface SyllabusItem {
  id: string;
  name: string;
  subjectName: string;
  chapterName: string;
  status: TopicStatus;
  priority: PriorityLevel;
  estimatedMinutes: number;
  notes?: string;
}

const DEFAULT_SUBJECTS = [
  "General Medicine",
  "General Surgery",
  "Obstetrics & Gynaecology",
  "Pediatrics",
  "Ophthalmology",
  "Otorhinolaryngology (ENT)",
  "Orthopedics",
  "Community Medicine",
];

const STARTER_MBBS_TOPICS: SyllabusItem[] = [
  {
    id: "med-1",
    name: "Acute Coronary Syndromes (STEMI & NSTEMI)",
    subjectName: "General Medicine",
    chapterName: "Cardiovascular System",
    status: "not_started",
    priority: "critical",
    estimatedMinutes: 90,
    notes: "Review ECG criteria, troponin markers, and emergency MONA protocol.",
  },
  {
    id: "med-2",
    name: "Heart Failure: NYHA Classification & Management",
    subjectName: "General Medicine",
    chapterName: "Cardiovascular System",
    status: "in_progress",
    priority: "high",
    estimatedMinutes: 60,
  },
  {
    id: "surg-1",
    name: "Acute Appendicitis: Diagnosis & Alvarado Score",
    subjectName: "General Surgery",
    chapterName: "Gastrointestinal Surgery",
    status: "completed",
    priority: "high",
    estimatedMinutes: 45,
  },
  {
    id: "surg-2",
    name: "Intestinal Obstruction: Small vs Large Bowel",
    subjectName: "General Surgery",
    chapterName: "Gastrointestinal Surgery",
    status: "not_started",
    priority: "medium",
    estimatedMinutes: 60,
  },
  {
    id: "peds-1",
    name: "Neonatal Resuscitation Protocol (NRP)",
    subjectName: "Pediatrics",
    chapterName: "Neonatology",
    status: "not_started",
    priority: "critical",
    estimatedMinutes: 75,
  },
];

export default function SyllabusManagementPage() {
  const [topics, setTopics] = React.useState<SyllabusItem[]>(STARTER_MBBS_TOPICS);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSubject, setSelectedSubject] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [showOnlyUnprepared, setShowOnlyUnprepared] = React.useState(false);

  // Manual topic addition modal
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [newTopicName, setNewTopicName] = React.useState("");
  const [newSubjectName, setNewSubjectName] = React.useState(DEFAULT_SUBJECTS[0]);
  const [newChapterName, setNewChapterName] = React.useState("");
  const [newPriority, setNewPriority] = React.useState<PriorityLevel>("medium");
  const [newEstimatedMinutes, setNewEstimatedMinutes] = React.useState(60);

  // PDF upload & review modal
  const [isPdfModalOpen, setIsPdfModalOpen] = React.useState(false);
  const [pdfUploading, setPdfUploading] = React.useState(false);
  const [extractedReviewTopics, setExtractedReviewTopics] = React.useState<ExtractedTopicItem[]>([]);
  const [scannedWarning, setScannedWarning] = React.useState<string | null>(null);

  // Status toggle handler
  const handleToggleStatus = (topicId: string) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          const nextStatus: TopicStatus =
            t.status === "not_started"
              ? "in_progress"
              : t.status === "in_progress"
              ? "completed"
              : "not_started";
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleDeleteTopic = (topicId: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
  };

  const handleAddManualTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    const newTopic: SyllabusItem = {
      id: `manual-${Date.now()}`,
      name: newTopicName.trim(),
      subjectName: newSubjectName,
      chapterName: newChapterName.trim() || "General",
      status: "not_started",
      priority: newPriority,
      estimatedMinutes: Number(newEstimatedMinutes) || 60,
    };

    setTopics((prev) => [newTopic, ...prev]);
    setIsAddModalOpen(false);
    setNewTopicName("");
    setNewChapterName("");
  };

  // PDF Upload Handler
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfUploading(true);
    setScannedWarning(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/syllabus/extract", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          res.status === 413
            ? "PDF file is too large to upload directly. Please upload a smaller section or compress the PDF."
            : `Server returned non-JSON response (${res.status}): ${text.substring(0, 120)}`
        );
      }

      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (data.isScannedOrImage) {
        setScannedWarning(
          "This PDF appears to be a scanned image or contains little readable text. Manual review or OCR may be needed."
        );
      }

      setExtractedReviewTopics(data.topics || []);
      setIsPdfModalOpen(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error extracting PDF");
    } finally {
      setPdfUploading(false);
      e.target.value = "";
    }
  };

  const handleApproveExtractedTopics = () => {
    const newItems: SyllabusItem[] = extractedReviewTopics.map((t) => ({
      id: t.id,
      name: t.name,
      subjectName: t.subjectName,
      chapterName: t.chapterName,
      status: "not_started",
      priority: t.priority,
      estimatedMinutes: t.estimatedMinutes,
    }));

    setTopics((prev) => [...newItems, ...prev]);
    setIsPdfModalOpen(false);
    setExtractedReviewTopics([]);
    setScannedWarning(null);
  };

  // Filter topics
  const filteredTopics = topics.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.chapterName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = selectedSubject === "all" || t.subjectName === selectedSubject;
    const matchesStatus = selectedStatus === "all" || t.status === selectedStatus;
    const matchesUnprepared = showOnlyUnprepared ? t.status !== "completed" : true;

    return matchesSearch && matchesSubject && matchesStatus && matchesUnprepared;
  });

  const uniqueSubjects = Array.from(new Set(topics.map((t) => t.subjectName)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Syllabus"
        description="Manage your medical syllabus hierarchy: University → Course → Subject → Chapter → Topic. Upload syllabus PDFs or create custom topics."
        badge={<Badge tone="teal">Active Syllabus</Badge>}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors">
              {pdfUploading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Extracting PDF...
                </>
              ) : (
                <>
                  <FileUp className="mr-1.5 h-3.5 w-3.5 text-[#0f2744]" />
                  Upload Syllabus PDF
                </>
              )}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={pdfUploading}
                onChange={handlePdfUpload}
              />
            </label>

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#0f2744] hover:bg-[#183a63] text-white text-xs h-9 px-3"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Topic
            </Button>
          </div>
        }
      />

      {/* Control Bar: Search & Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search topics, chapters, or subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0d9488] focus:outline-none focus:ring-1 focus:ring-[#0d9488]"
              />
            </div>

            {/* Filter Dropdowns & Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter by subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-[#0d9488] focus:outline-none"
              >
                <option value="all">All Subjects ({topics.length})</option>
                {uniqueSubjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-[#0d9488] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <button
                type="button"
                onClick={() => setShowOnlyUnprepared(!showOnlyUnprepared)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  showOnlyUnprepared
                    ? "border-[#0d9488] bg-[#f0fdfa] text-[#0d9488]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                Show Only Unprepared
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topics List Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Syllabus Topics ({filteredTopics.length})</CardTitle>
            <CardDescription>
              Click status icon to toggle: Not Started → In Progress → Completed. Completed topics can be hidden using the Unprepared filter.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTopics.length === 0 ? (
            <div className="p-6">
              <EmptyState
                compact
                icon={<BookOpen className="h-5 w-5" />}
                title="No topics match your filter"
                description="Try clearing search query or disabling the 'Show Only Unprepared' toggle."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(topic.id)}
                      className="mt-0.5 text-slate-400 hover:text-[#0d9488] transition-colors"
                      title={`Current: ${topic.status}. Click to change.`}
                    >
                      {topic.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-[#0d9488]" />
                      ) : topic.status === "in_progress" ? (
                        <Clock className="h-5 w-5 text-amber-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            topic.status === "completed"
                              ? "line-through text-slate-400"
                              : "text-slate-900"
                          }`}
                        >
                          {topic.name}
                        </span>
                        <Badge
                          tone={
                            topic.priority === "critical"
                              ? "rose"
                              : topic.priority === "high"
                              ? "amber"
                              : "slate"
                          }
                        >
                          {topic.priority}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium text-[#0f2744]">
                          {topic.subjectName}
                        </span>
                        <span>•</span>
                        <span>{topic.chapterName}</span>
                        <span>•</span>
                        <span>~{topic.estimatedMinutes} mins</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteTopic(topic.id)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete topic"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Topic Add Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-add-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        >
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 id="modal-add-title" className="text-base font-semibold text-slate-900">Add New Syllabus Topic</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualTopic} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700">Topic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diabetic Ketoacidosis (DKA) Management"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm text-slate-900 focus:border-[#0d9488] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700">Subject</label>
                  <select
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-[#0d9488] focus:outline-none"
                  >
                    {DEFAULT_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Chapter / Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. Endocrinology"
                    value={newChapterName}
                    onChange={(e) => setNewChapterName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-[#0d9488] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-[#0d9488] focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">Estimated Duration (mins)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={newEstimatedMinutes}
                    onChange={(e) => setNewEstimatedMinutes(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-[#0d9488] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#0f2744] text-white">
                  Add to Syllabus
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Syllabus Review & Approval Modal */}
      {isPdfModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-review-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        >
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 id="modal-review-title" className="text-base font-semibold text-slate-900">
                  Review Extracted Syllabus Topics ({extractedReviewTopics.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Review extracted topics before approving them into your active syllabus.
                </p>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {scannedWarning && (
              <div className="my-3 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <p>{scannedWarning}</p>
              </div>
            )}

            <div className="my-3 flex-1 overflow-y-auto divide-y divide-slate-100 pr-2">
              {extractedReviewTopics.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No topics were automatically parsed. You can manually enter topics using the Add Topic button.
                </div>
              ) : (
                extractedReviewTopics.map((topic, idx) => (
                  <div key={topic.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <input
                        type="text"
                        value={topic.name}
                        onChange={(e) => {
                          const updated = [...extractedReviewTopics];
                          updated[idx].name = e.target.value;
                          setExtractedReviewTopics(updated);
                        }}
                        className="w-full text-xs font-medium text-slate-900 border-b border-transparent hover:border-slate-200 focus:border-[#0d9488] focus:outline-none"
                      />
                      <div className="flex gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{topic.subjectName}</span>
                        <span>•</span>
                        <span>{topic.chapterName}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setExtractedReviewTopics((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                {extractedReviewTopics.length} topics ready to save
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsPdfModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleApproveExtractedTopics}
                  disabled={extractedReviewTopics.length === 0}
                  className="bg-[#0d9488] hover:bg-[#0f766e] text-white"
                >
                  Approve &amp; Save Topics
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
