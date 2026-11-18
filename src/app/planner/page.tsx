"use client";

import * as React from "react";
import {
  RefreshCw,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  Circle,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateStudyPlan, type PlannerDaySchedule } from "@/lib/planner/scheduler";

const SAMPLE_STUDY_TOPICS = [
  { id: "t1", name: "Acute Coronary Syndromes (STEMI & NSTEMI)", subjectName: "General Medicine", priority: "critical" as const, estimatedMinutes: 90, status: "not_started" },
  { id: "t2", name: "Heart Failure: NYHA Classification & Management", subjectName: "General Medicine", priority: "high" as const, estimatedMinutes: 60, status: "not_started" },
  { id: "t3", name: "Intestinal Obstruction: Small vs Large Bowel", subjectName: "General Surgery", priority: "medium" as const, estimatedMinutes: 60, status: "not_started" },
  { id: "t4", name: "Neonatal Resuscitation Protocol (NRP)", subjectName: "Pediatrics", priority: "critical" as const, estimatedMinutes: 75, status: "not_started" },
  { id: "t5", name: "Preeclampsia & Eclampsia Management", subjectName: "Obstetrics", priority: "high" as const, estimatedMinutes: 60, status: "not_started" },
  { id: "t6", name: "Diabetic Ketoacidosis (DKA) Protocol", subjectName: "General Medicine", priority: "critical" as const, estimatedMinutes: 60, status: "not_started" },
  { id: "t7", name: "Tuberculosis: Diagnostic & NTEP Regimen", subjectName: "General Medicine", priority: "high" as const, estimatedMinutes: 90, status: "not_started" },
  { id: "t8", name: "Pneumothorax: Tension vs Open Management", subjectName: "General Surgery", priority: "critical" as const, estimatedMinutes: 45, status: "not_started" },
];

const DEFAULT_TARGET_EXAM_DATE = "2026-12-15";

export default function PlannerPage() {
  const [dailyHours, setDailyHours] = React.useState(3.5);
  const [examDate, setExamDate] = React.useState(DEFAULT_TARGET_EXAM_DATE);
  const [scheduleData, setScheduleData] = React.useState<PlannerDaySchedule[]>(() => {
    return generateStudyPlan({
      examDate: DEFAULT_TARGET_EXAM_DATE,
      dailyHours: 3.5,
      preferredDays: [0, 1, 2, 3, 4, 5, 6],
      topics: SAMPLE_STUDY_TOPICS,
    }).schedule;
  });
  const [isOverloaded, setIsOverloaded] = React.useState(false);
  const [overloadHours, setOverloadHours] = React.useState(0);
  const [isRescheduling, setIsRescheduling] = React.useState(false);

  // Manual regenerate / reschedule handler
  const handleBuildSchedule = React.useCallback(() => {
    setIsRescheduling(true);
    const result = generateStudyPlan({
      examDate,
      dailyHours,
      preferredDays: [0, 1, 2, 3, 4, 5, 6],
      topics: SAMPLE_STUDY_TOPICS,
    });

    setScheduleData(result.schedule);
    setIsOverloaded(result.isOverloaded);
    setOverloadHours(Math.round((result.overloadMinutes / 60) * 10) / 10);
    setIsRescheduling(false);
  }, [examDate, dailyHours]);

  // Toggle task completion
  const handleToggleTask = (dayIndex: number, taskId: string) => {
    setScheduleData((prev) => {
      const copy = [...prev];
      const targetDay = { ...copy[dayIndex] };
      targetDay.tasks = targetDay.tasks.map((t) =>
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      );
      copy[dayIndex] = targetDay;
      return copy;
    });
  };

  // Toggle lock
  const handleToggleLock = (dayIndex: number, taskId: string) => {
    setScheduleData((prev) => {
      const copy = [...prev];
      const targetDay = { ...copy[dayIndex] };
      targetDay.tasks = targetDay.tasks.map((t) =>
        t.id === taskId ? { ...t, isLocked: !t.isLocked } : t
      );
      copy[dayIndex] = targetDay;
      return copy;
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Intelligent Study Planner"
        description="Distributes unfinished topics across available days before exams, prioritizes critical topics, and dynamically reorganizes when you fall behind."
        badge={<Badge tone="teal">Dynamic Timetable</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={handleBuildSchedule}
              disabled={isRescheduling}
              className="bg-[#0f2744] hover:bg-[#183a63] text-white text-xs h-9 px-3"
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isRescheduling ? "animate-spin" : ""}`} />
              Reschedule &amp; Reorganize
            </Button>
          </div>
        }
      />

      {/* Configuration Controls Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-slate-700">Target Examination Date</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-[#0d9488] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700">Daily Available Study Hours</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="16"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-[#0d9488] focus:outline-none"
                />
                <span className="text-xs text-slate-500 whitespace-nowrap">hours / day</span>
              </div>
            </div>

            <div className="flex items-end">
              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100 w-full text-xs text-slate-600 flex items-center justify-between">
                <span>Active Unprepared Topics:</span>
                <span className="font-mono font-bold text-[#0f2744]">
                  {SAMPLE_STUDY_TOPICS.length} topics
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Honest Overload Warning Banner */}
      {isOverloaded && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-900">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-amber-950">Study Workload Exceeds Available Time</h4>
            <p className="leading-relaxed">
              Total unfinished topics require roughly <strong>{overloadHours} hours</strong> more than your available study window before {examDate}. MedPrep AI has scheduled all topics to prevent silent drops, but recommends increasing daily study hours or extending your revision deadline.
            </p>
          </div>
        </div>
      )}

      {/* Calendar Columns / Day Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#0d9488]" />
            Daily Study Schedule ({scheduleData.length} Study Days Planned)
          </h3>
          <span className="text-xs text-slate-500">
            Click checkbox to mark scheduled completion
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scheduleData.map((day, dayIndex) => {
            const totalHours = Math.round((day.scheduledMinutes / 60) * 10) / 10;
            const completedCount = day.tasks.filter((t) => t.isCompleted).length;

            return (
              <Card key={day.date} className="border-slate-200/90 flex flex-col justify-between">
                <CardHeader className="bg-slate-50/60 pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#0f2744]">
                        {day.dayOfWeek}
                      </span>
                      <p className="text-[11px] text-slate-500">{day.date}</p>
                    </div>
                    <Badge tone={totalHours > dailyHours ? "amber" : "teal"}>
                      {totalHours}h / {dailyHours}h
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-3 flex-1 space-y-2">
                  {day.tasks.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Rest &amp; Revision Day
                    </div>
                  ) : (
                    day.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`rounded-lg border p-2.5 transition-colors text-xs space-y-1.5 ${
                          task.isCompleted
                            ? "border-emerald-200 bg-emerald-50/40"
                            : "border-slate-100 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(dayIndex, task.id)}
                            className="mt-0.5 text-slate-400 hover:text-[#0d9488]"
                          >
                            {task.isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-[#0d9488]" />
                            ) : (
                              <Circle className="h-4 w-4 text-slate-300" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`font-medium ${
                                task.isCompleted
                                  ? "line-through text-slate-400"
                                  : "text-slate-900"
                              }`}
                            >
                              {task.title}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <span>{task.subjectName}</span>
                              <span>•</span>
                              <span>{task.estimatedMinutes}m</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleLock(dayIndex, task.id)}
                            title={task.isLocked ? "Locked from automatic rescheduling" : "Click to lock task"}
                            className="text-slate-300 hover:text-slate-600"
                          >
                            {task.isLocked ? (
                              <Lock className="h-3.5 w-3.5 text-amber-600" />
                            ) : (
                              <Unlock className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>

                <div className="border-t border-slate-100 p-2.5 px-3 bg-slate-50/30 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {completedCount} of {day.tasks.length} tasks done
                  </span>
                  <span>{day.tasks.length > 0 && completedCount === day.tasks.length ? "✓ Day Completed" : ""}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
