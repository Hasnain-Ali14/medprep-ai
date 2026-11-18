import type { Metadata } from "next";
import Link from "next/link";
import { User, Clock, Bell, Shield } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Personalization"
        description="Manage your student profile, university details, daily study hours, and examination reminder preferences."
        badge={<Badge tone="navy">Milestone 2 Database Sync</Badge>}
        actions={
          <Link
            href="/"
            className={buttonClasses({ variant: "outline", size: "sm" })}
          >
            Back to Dashboard
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#0f2744]" />
              Student Profile &amp; Academic Info
            </CardTitle>
            <CardDescription>
              Full name, university, course (e.g. MBBS), and academic year.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs leading-relaxed text-slate-500">
            Editable form connects to your private{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
              profiles
            </code>{" "}
            table once Supabase Authentication is wired in Milestone 2.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#0d9488]" />
              Study Schedule Preferences
            </CardTitle>
            <CardDescription>
              Daily available study hours, preferred study days, and optional
              start/end times.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs leading-relaxed text-slate-500">
            Stored in{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
              user_preferences
            </code>{" "}
            and used automatically as defaults by the Intelligent Study Planner.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#0f2744]" />
              Examination Reminders
            </CardTitle>
            <CardDescription>
              Control reminder alerts and upcoming exam countdown notices.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs leading-relaxed text-slate-500">
            Configurable per student account once authentication is active.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#0d9488]" />
              Account &amp; Data Privacy
            </CardTitle>
            <CardDescription>
              Protected by Supabase Auth and Row Level Security (RLS).
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs leading-relaxed text-slate-500">
            Every student&apos;s syllabus, examinations, and study plans remain
            strictly isolated to their own authenticated account.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
