import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  CalendarRange,
  BarChart3,
  Timer,
  Settings,
  Sparkles,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  shortDescription: string;
}

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    shortDescription: "Overview & daily targets",
  },
  {
    label: "AI Question Generator",
    href: "/generator",
    icon: Sparkles,
    shortDescription: "Generate USMLE, UHS, & FCPS MCQs",
  },
  {
    label: "My Syllabus",
    href: "/syllabus",
    icon: BookOpen,
    shortDescription: "Subjects, chapters, topics & PDF upload",
  },
  {
    label: "Study Planner",
    href: "/planner",
    icon: CalendarRange,
    shortDescription: "Smart daily timetable & rescheduling",
  },
  {
    label: "Progress Analytics",
    href: "/analytics",
    icon: BarChart3,
    shortDescription: "Completion trends & study consistency",
  },
  {
    label: "Examination Countdown",
    href: "/exams",
    icon: Timer,
    shortDescription: "Upcoming exams & days remaining",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    shortDescription: "Profile, study hours & preferences",
  },
];
