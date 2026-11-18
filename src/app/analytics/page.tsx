"use client";

import * as React from "react";
import {
  BookCheck,
  CalendarCheck2,
  Clock,
  Activity,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";

const SUBJECT_COMPLETION_DATA = [
  { subject: "Medicine", total: 180, completed: 85, percent: 47 },
  { subject: "Surgery", total: 140, completed: 92, percent: 65 },
  { subject: "Obstetrics", total: 95, completed: 58, percent: 61 },
  { subject: "Pediatrics", total: 75, completed: 48, percent: 64 },
  { subject: "Ophthalmology", total: 50, completed: 35, percent: 70 },
  { subject: "ENT", total: 45, completed: 30, percent: 66 },
];

const WEEKLY_CONSISTENCY_DATA = [
  { day: "Mon", plannedHours: 4, actualHours: 3.5 },
  { day: "Tue", plannedHours: 4, actualHours: 4.2 },
  { day: "Wed", plannedHours: 4, actualHours: 4.0 },
  { day: "Thu", plannedHours: 4, actualHours: 2.5 },
  { day: "Fri", plannedHours: 4, actualHours: 4.5 },
  { day: "Sat", plannedHours: 5, actualHours: 5.0 },
  { day: "Sun", plannedHours: 5, actualHours: 3.8 },
];

export default function AnalyticsPage() {
  const syllabusCompletionPercent = 60;
  const taskCompletionPercent = 78;
  const studyHoursLogged = 27.5;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Progress Analytics"
        description="Comprehensive preparation insights strictly distinguishing syllabus topic mastery, daily scheduled task completion, and actual study time."
        badge={<Badge tone="teal">Verified Metrics</Badge>}
      />

      {/* 3 Core Distinct Measurement Pillars */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                1. Syllabus Topic Mastery
              </span>
              <BookCheck className="h-4 w-4 text-[#0f2744]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-slate-900">
                {syllabusCompletionPercent}%
              </span>
              <span className="text-xs text-slate-500">348 / 585 topics</span>
            </div>
            <div className="mt-3">
              <ProgressBar value={syllabusCompletionPercent} accent="navy" />
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Permanent syllabus progress across all MBBS subjects.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                2. Scheduled Task Completion
              </span>
              <CalendarCheck2 className="h-4 w-4 text-[#0d9488]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-slate-900">
                {taskCompletionPercent}%
              </span>
              <span className="text-xs text-slate-500">36 / 46 tasks</span>
            </div>
            <div className="mt-3">
              <ProgressBar value={taskCompletionPercent} accent="teal" />
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Timetable task adherence for active examination plan.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                3. Actual Study Time Logged
              </span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-slate-900">
                {studyHoursLogged}h
              </span>
              <span className="text-xs text-slate-500">this week</span>
            </div>
            <div className="mt-3">
              <ProgressBar value={88} accent="teal" />
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              88% of 31.0 planned hours achieved this week.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Subject-Wise Preparation */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#0d9488]" />
              Subject-Wise Completion (%)
            </CardTitle>
            <CardDescription>
              Percentage of completed topics per medical subject.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SUBJECT_COMPLETION_DATA} layout="vertical" margin={{ left: 15, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="subject" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, "Completion"]}
                    contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                  />
                  <Bar dataKey="percent" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Study Consistency */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#0f2744]" />
              Planned vs Actual Study Hours
            </CardTitle>
            <CardDescription>
              Adherence to your daily study-hour target throughout the week.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={WEEKLY_CONSISTENCY_DATA} margin={{ left: -10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis unit="h" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="plannedHours"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    name="Target Hours"
                  />
                  <Line
                    type="monotone"
                    dataKey="actualHours"
                    stroke="#0f2744"
                    strokeWidth={2}
                    name="Logged Hours"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
