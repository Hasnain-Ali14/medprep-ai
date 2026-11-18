import Link from "next/link";
import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileUp,
  Sparkles,
  Activity,
  ArrowRight,
  ListChecks,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import type { DashboardMetrics } from "@/lib/types/domain";

/**
 * Initial honest zero-state metrics.
 * Will be populated directly from Supabase PostgreSQL queries in Milestones 2–4.
 */
const INITIAL_METRICS: DashboardMetrics = {
  totalTopics: 0,
  completedTopics: 0,
  inProgressTopics: 0,
  pendingTopics: 0,
  syllabusCompletionPercent: 0,
  scheduledTasksTotal: 0,
  scheduledTasksCompleted: 0,
  overdueTasksCount: 0,
  todayTargetCount: 0,
  loggedStudyMinutesToday: 0,
  nextExam: null,
};

export default function DashboardPage() {
  const metrics = INITIAL_METRICS;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome to MedPrep AI"
        description="Track your MBBS syllabus, monitor preparation across subjects, and stay on schedule for your upcoming university examinations."
        badge={<Badge tone="teal">MBBS Workspace</Badge>}
        actions={
          <>
            <Link
              href="/exams"
              className={buttonClasses({ variant: "outline", size: "md" })}
            >
              <CalendarClock className="h-4 w-4" />
              Set Exam Date
            </Link>
            <Link
              href="/syllabus"
              className={buttonClasses({ variant: "primary", size: "md" })}
            >
              <FileUp className="h-4 w-4" />
              Add Syllabus
            </Link>
          </>
        }
      />

      {/* First-Time Student Onboarding Guide */}
      <Card className="border-[#d3e0f0] bg-gradient-to-r from-[#eef3f9]/80 via-white to-[#f0fdfa]/70">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[#0d9488] uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                Getting Started
              </div>
              <h2 className="text-base font-semibold text-[#0f2744]">
                Set up your study workspace in three quick steps
              </h2>
              <p className="max-w-2xl text-xs leading-relaxed text-slate-600">
                All statistics below are calculated strictly from your real
                syllabus and study records. Once you add your syllabus and exam
                date, MedPrep AI builds and adapts your daily study plan.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:shrink-0">
              <Link
                href="/syllabus"
                className="group flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 transition-colors hover:border-[#0f2744]/30 hover:bg-slate-50"
              >
                <span>1. Upload Syllabus</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0f2744]" />
              </Link>
              <Link
                href="/exams"
                className="group flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 transition-colors hover:border-[#0f2744]/30 hover:bg-slate-50"
              >
                <span>2. Set Exam Date</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0f2744]" />
              </Link>
              <Link
                href="/planner"
                className="group flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 transition-colors hover:border-[#0f2744]/30 hover:bg-slate-50"
              >
                <span>3. Build Study Plan</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0f2744]" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary KPI Grid */}
      <section
        aria-label="Preparation overview statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        {/* Upcoming Exam Countdown Card */}
        <Card className="border-[#d3e0f0] bg-[#0f2744] text-white sm:col-span-2 xl:col-span-1">
          <CardContent className="flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">
                Next Examination
              </span>
              <CalendarClock className="h-4 w-4 text-[#2dd4bf]" />
            </div>
            <div className="my-3">
              <p className="font-mono text-2xl font-semibold tracking-tight">
                {metrics.nextExam
                  ? `${metrics.nextExam.daysRemaining}d`
                  : "—"}
              </p>
              <p className="mt-1 text-xs text-slate-300">
                {metrics.nextExam
                  ? `${metrics.nextExam.name} · ${metrics.nextExam.examDate}`
                  : "No exam scheduled yet"}
              </p>
            </div>
            <Link
              href="/exams"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#5eead4] hover:text-white transition-colors"
            >
              Add examination date
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Total Topics */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Total Topics
              </span>
              <BookOpen className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold text-slate-900">
              {metrics.totalTopics}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Across 0 syllabus subjects
            </p>
          </CardContent>
        </Card>

        {/* Completed Topics */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Completed
              </span>
              <CheckCircle2 className="h-4 w-4 text-[#0d9488]" />
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold text-slate-900">
              {metrics.completedTopics}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {metrics.syllabusCompletionPercent}% overall completion
            </p>
          </CardContent>
        </Card>

        {/* In Progress Topics */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                In Progress
              </span>
              <Clock className="h-4 w-4 text-[#0f2744]" />
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold text-slate-900">
              {metrics.inProgressTopics}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Currently active topics
            </p>
          </CardContent>
        </Card>

        {/* Pending Topics */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Pending
              </span>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold text-slate-900">
              {metrics.pendingTopics}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Not started yet
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Overall Preparation Progress Bar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Overall Syllabus Preparation</CardTitle>
            <CardDescription>
              Percentage of total syllabus topics marked as completed.
            </CardDescription>
          </div>
          <span className="font-mono text-lg font-semibold text-[#0f2744]">
            {metrics.syllabusCompletionPercent}%
          </span>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <ProgressBar
            value={metrics.syllabusCompletionPercent}
            label="Overall syllabus completion"
            accent="teal"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              {metrics.completedTopics} of {metrics.totalTopics} topics completed
            </span>
            <Link
              href="/analytics"
              className="font-medium text-[#0f2744] hover:text-[#0d9488] transition-colors"
            >
              View detailed analytics →
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Two-Column Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Subject-wise Progress & Recent Activity */}
        <div className="space-y-6 lg:col-span-7">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Subject-Wise Progress</CardTitle>
                <CardDescription>
                  Completion percentage for each MBBS subject in your syllabus.
                </CardDescription>
              </div>
              <Link
                href="/syllabus"
                className="text-xs font-medium text-[#0f2744] hover:text-[#0d9488] transition-colors"
              >
                Manage syllabus
              </Link>
            </CardHeader>
            <CardContent>
              <EmptyState
                compact
                icon={<BookOpen className="h-5 w-5" />}
                title="No syllabus subjects added yet"
                description="Upload your university syllabus PDF or create MBBS subjects manually (such as Medicine, Surgery, Pediatrics, and OBG) to start tracking subject-wise completion."
                primaryAction={{
                  label: "Go to My Syllabus",
                  href: "/syllabus",
                  variant: "primary",
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest completed topics, study sessions, and schedule adjustments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                compact
                icon={<Activity className="h-5 w-5" />}
                title="No study activity recorded yet"
                description="As you mark topics in progress or completed, your study timeline and progress history will appear here automatically."
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Today's Study Targets & Overdue Topics */}
        <div className="space-y-6 lg:col-span-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Today&apos;s Study Targets</CardTitle>
                <CardDescription>
                  Scheduled topics from your active study plan.
                </CardDescription>
              </div>
              <Badge tone="slate">{metrics.todayTargetCount} planned</Badge>
            </CardHeader>
            <CardContent>
              <EmptyState
                compact
                icon={<ListChecks className="h-5 w-5" />}
                title="No study targets for today"
                description="Once you add unfinished topics and an examination date, the Study Planner will generate a realistic daily timetable for you."
                primaryAction={{
                  label: "Open Study Planner",
                  href: "/planner",
                  variant: "teal",
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Overdue Topics</CardTitle>
                <CardDescription>
                  Missed scheduled tasks ready for intelligent rescheduling.
                </CardDescription>
              </div>
              <Badge tone={metrics.overdueTasksCount > 0 ? "amber" : "emerald"}>
                {metrics.overdueTasksCount} overdue
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-xs leading-relaxed text-slate-600">
                <p className="font-medium text-slate-800">
                  Nothing overdue right now.
                </p>
                <p className="mt-1 text-slate-500">
                  If you ever fall behind your planned timetable, overdue items
                  will surface here so you can redistribute them realistically
                  across your remaining days before exams.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
