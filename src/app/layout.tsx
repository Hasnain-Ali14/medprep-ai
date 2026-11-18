import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MedPrep AI — Intelligent Medical Syllabus & Exam Preparation",
    template: "%s · MedPrep AI",
  },
  description:
    "Organize your MBBS university syllabus, track topic mastery, and generate adaptive daily study plans before examinations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f8fafc] text-slate-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
