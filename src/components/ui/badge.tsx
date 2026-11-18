import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "slate" | "navy" | "teal" | "emerald" | "amber" | "rose";

const toneStyles: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-700 border-slate-200/80",
  navy: "bg-[#eef3f9] text-[#0f2744] border-[#d3e0f0]",
  teal: "bg-[#f0fdfa] text-[#0f766e] border-[#ccfbf1]",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  amber: "bg-amber-50 text-amber-800 border-amber-200/80",
  rose: "bg-rose-50 text-rose-700 border-rose-200/80",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = "slate", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
