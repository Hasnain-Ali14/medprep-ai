"use client";

import * as React from "react";
import {
  Timer,
  Plus,
  Calendar,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export interface ExamItem {
  id: string;
  name: string;
  examDate: string; // YYYY-MM-DD
  associatedSubjects: string[];
  notes?: string;
}

const INITIAL_EXAMS: ExamItem[] = [
  {
    id: "exam-1",
    name: "Final Professional MBBS (Part II)",
    examDate: "2026-12-30",
    associatedSubjects: ["General Medicine", "General Surgery", "Obstetrics & Gynaecology", "Pediatrics"],
    notes: "Main university theory examinations.",
  },
  {
    id: "exam-2",
    name: "Internal Assessment - Surgery & Allied",
    examDate: "2026-12-05",
    associatedSubjects: ["General Surgery", "Orthopedics"],
  },
];

function subscribeToTime() {
  return () => {};
}

function getClientTodayMs() {
  return new Date().setHours(0, 0, 0, 0);
}

function getServerTodayMs() {
  return new Date("2026-11-18").setHours(0, 0, 0, 0);
}

export default function ExamsPage() {
  const [exams, setExams] = React.useState<ExamItem[]>(INITIAL_EXAMS);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [examName, setExamName] = React.useState("");
  const [examDate, setExamDate] = React.useState("");
  const [examSubjects, setExamSubjects] = React.useState("General Medicine, General Surgery");
  const [examNotes, setExamNotes] = React.useState("");

  const nowMs = React.useSyncExternalStore(subscribeToTime, getClientTodayMs, getServerTodayMs);

  const calculateDaysRemaining = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const diff = Math.ceil((target - nowMs) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || !examDate) return;

    const newExam: ExamItem = {
      id: `exam-${Date.now()}`,
      name: examName.trim(),
      examDate,
      associatedSubjects: examSubjects.split(",").map((s) => s.trim()).filter(Boolean),
      notes: examNotes.trim() || undefined,
    };

    setExams((prev) => [...prev, newExam]);
    setIsAddModalOpen(false);
    setExamName("");
    setExamDate("");
    setExamNotes("");
  };

  const handleDeleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examination Countdown"
        description="Schedule and monitor multiple upcoming medical examinations. MedPrep AI tracks separate countdowns and workloads for each."
        badge={<Badge tone="teal">Active Countdowns</Badge>}
        actions={
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#0f2744] hover:bg-[#183a63] text-white text-xs h-9 px-3"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Examination
          </Button>
        }
      />

      {/* Grid of Active Exams */}
      {exams.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={<Timer className="h-5 w-5" />}
              title="No upcoming examinations scheduled"
              description="Add an exam date to calculate preparation days and automatically build an intelligent study timetable."
              primaryAction={{
                label: "Add First Exam",
                href: "#",
                variant: "primary",
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {exams.map((exam) => {
            const daysLeft = calculateDaysRemaining(exam.examDate);
            const isUrgent = daysLeft <= 14;

            return (
              <Card key={exam.id} className="relative overflow-hidden border-slate-200 shadow-xs">
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isUrgent ? "bg-amber-500" : "bg-[#0d9488]"
                  }`}
                />
                <CardHeader className="flex flex-row items-start justify-between pt-5 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base text-slate-900">{exam.name}</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{exam.examDate}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteExam(exam.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete examination"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Days Remaining</span>
                      <p className="font-mono text-3xl font-bold text-[#0f2744]">
                        {daysLeft === null ? "..." : daysLeft > 0 ? `${daysLeft} Days` : daysLeft === 0 ? "Today" : "Completed"}
                      </p>
                    </div>
                    <Badge tone={daysLeft !== null && isUrgent ? "amber" : "teal"}>
                      {daysLeft !== null && isUrgent ? "Upcoming Soon" : "On Track"}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Included Subjects
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {exam.associatedSubjects.map((sub) => (
                        <span
                          key={sub}
                          className="rounded-md bg-[#eef3f9] px-2 py-0.5 text-xs font-medium text-[#0f2744]"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {exam.notes && (
                    <p className="text-xs text-slate-500 border-t border-slate-100 pt-2">
                      {exam.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Examination Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-exam-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h3 id="modal-exam-title" className="text-base font-semibold text-slate-900">
              Add Upcoming Examination
            </h3>

            <form onSubmit={handleAddExam} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-700">Exam Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3rd Professional MBBS Exam"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-[#0d9488] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Exam Date</label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-[#0d9488] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">
                  Included Subjects (comma separated)
                </label>
                <input
                  type="text"
                  value={examSubjects}
                  onChange={(e) => setExamSubjects(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-[#0d9488] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Clinical viva scheduled after theory papers"
                  value={examNotes}
                  onChange={(e) => setExamNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-[#0d9488] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#0f2744] text-white">
                  Save Examination
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
