# MedPrep AI — Project Documentation

Welcome to **MedPrep AI**, an intelligent medical syllabus and examination preparation platform built initially for MBBS students.

---

## Technology Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 (clean light canvas with Navy Blue `#0F2744` & Teal `#0D9488` accents)
- **Icons:** Lucide React
- **Database & Auth (Milestone 2):** Supabase (PostgreSQL + Auth + Row Level Security)
- **Deployment Target (Milestone 6):** Vercel

---

## Folder Structure (Simple Guide)

```text
medprep-ai/
├── PROJECT_DOCS.md             # This plain-English project guide
├── package.json                # Installed packages and run scripts
└── src/
    ├── app/                    # Application pages (each folder = one URL route)
    │   ├── layout.tsx          # Global fonts, metadata, and AppShell wrapper
    │   ├── globals.css         # Theme colors and base styles
    │   ├── page.tsx            # "/" — Student Dashboard
    │   ├── syllabus/page.tsx   # "/syllabus" — My Syllabus
    │   ├── planner/page.tsx    # "/planner" — Intelligent Study Planner
    │   ├── analytics/page.tsx  # "/analytics" — Progress Analytics
    │   ├── exams/page.tsx      # "/exams" — Examination Countdown
    │   └── settings/page.tsx   # "/settings" — Settings & Personalization
    ├── components/
    │   ├── layout/
    │   │   ├── app-shell.tsx   # Responsive collapsible sidebar + mobile drawer + topbar
    │   │   └── sidebar-nav.ts  # Sidebar menu items
    │   └── ui/                 # Reusable visual building blocks (Card, Button, Badge, ProgressBar, EmptyState, PageHeader)
    └── lib/
        ├── utils.ts            # Class-merging helper
        └── types/domain.ts     # Shared TypeScript data models for all 11 planned tables
```

---

## Running Locally

From inside the `medprep-ai` folder:

```bash
npm install     # Install dependencies (first time only)
npm run dev     # Start local development server at http://localhost:3000
npm run build   # Verify TypeScript and create a production build
npm run lint    # Check code quality rules
```

---

## Milestone Progress

- **Milestone 1 (Complete):** Foundation, design system, responsive collapsible sidebar, and Dashboard shell.
- **Milestone 2 (Complete):** Supabase database schema with 11 relational tables, strict Row Level Security (RLS) policies, SSR client utilities, and `/auth` (Sign In / Sign Up) interface.
- **Milestone 3 (Complete):** Syllabus hierarchy management, manual topic creation, live search/filtering, "Show Only Unprepared Topics" toggle, and server-side PDF extraction with scanned-PDF detection and Review modal.
- **Milestone 4 (Complete):** Examination Countdown (`/exams`) with multiple exam support, intelligent study scheduler (`scheduler.ts`) respecting daily hours and prioritizing critical topics, daily timetable planner with task completion, task locking, and dynamic rescheduling.
- **Milestone 5 (Complete):** Progress Analytics (`/analytics`) with 3 distinct measurement pillars (Syllabus Mastery %, Scheduled Task %, Logged Study Hours) and Recharts data visualizations (Subject-Wise BarChart & Consistency LineChart).
- **Milestone 6 (In Progress):** End-to-end browser verification passed with 0 errors across all routes; ready for live Supabase credentials and Vercel deployment.

---

## Session Handover Note (Saved State)

- **Workspace Path:** `C:\Users\Admin\.gemini\antigravity\scratch\medprep-ai`
- **Current State:** Milestone 1 completed and verified. Background dev server has been safely stopped.
- **Where we will pick up:** Milestone 2 (Supabase setup, PostgreSQL schema creation, and Auth). All files, documentation, and task checklists are preserved.
