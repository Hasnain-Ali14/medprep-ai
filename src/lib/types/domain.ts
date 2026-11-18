/**
 * Core domain types for MedPrep AI.
 * These mirror our relational Supabase PostgreSQL schema so every module
 * stays strictly typed and cleanly extensible (including future AI features).
 */

export type TopicStatus = "not_started" | "in_progress" | "completed";
export type PriorityLevel = "low" | "medium" | "high" | "critical";
export type TaskStatus = "pending" | "in_progress" | "completed" | "skipped";

export interface Profile {
  id: string;
  fullName: string | null;
  email: string;
  universityName: string | null;
  courseName: string | null;
  academicYear: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  userId: string;
  dailyStudyHours: number;
  preferredStudyDays: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
  studyStartTime: string | null; // e.g. "08:00"
  studyEndTime: string | null; // e.g. "21:00"
  examRemindersEnabled: boolean;
  theme: "light" | "system";
  updatedAt: string;
}

export interface University {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface Course {
  id: string;
  userId: string;
  universityId: string;
  name: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  userId: string;
  courseId: string | null;
  name: string;
  color: string;
  sortOrder: number;
  createdAt: string;
}

export interface Chapter {
  id: string;
  userId: string;
  subjectId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
}

export interface Topic {
  id: string;
  userId: string;
  subjectId: string;
  chapterId: string | null;
  parentTopicId: string | null; // Supports Subtopics
  name: string;
  status: TopicStatus;
  priority: PriorityLevel;
  estimatedMinutes: number;
  completedAt: string | null;
  notes: string | null;
  isExcludedFromPlanner: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Examination {
  id: string;
  userId: string;
  name: string;
  examDate: string; // ISO date string (YYYY-MM-DD)
  subjectIds: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  examinationId: string;
  dailyHours: number;
  preferredDays: number[];
  startTime: string | null;
  endTime: string | null;
  lastRescheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudyTask {
  id: string;
  userId: string;
  studyPlanId: string;
  topicId: string | null; // Nullable to allow personal study tasks
  title: string;
  subjectId: string | null;
  scheduledDate: string; // YYYY-MM-DD
  estimatedMinutes: number;
  priority: PriorityLevel;
  status: TaskStatus;
  isLocked: boolean;
  isPersonalTask: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  topicId: string | null;
  studyTaskId: string | null;
  durationMinutes: number;
  sessionDate: string; // YYYY-MM-DD
  createdAt: string;
}

/**
 * Aggregated metrics for Dashboard & Analytics.
 * Explicitly separates Syllabus Completion, Scheduled Task Completion, and Study Time.
 */
export interface DashboardMetrics {
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  pendingTopics: number;
  syllabusCompletionPercent: number;
  scheduledTasksTotal: number;
  scheduledTasksCompleted: number;
  overdueTasksCount: number;
  todayTargetCount: number;
  loggedStudyMinutesToday: number;
  nextExam: {
    id: string;
    name: string;
    examDate: string;
    daysRemaining: number;
  } | null;
}
