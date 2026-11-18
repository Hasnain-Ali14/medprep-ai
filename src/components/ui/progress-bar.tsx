import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  accent?: "navy" | "teal";
  className?: string;
}

export function ProgressBar({
  value,
  label,
  accent = "teal",
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}
      role="progressbar"
      aria-label={label ?? "Progress"}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300",
          accent === "teal" ? "bg-[#0d9488]" : "bg-[#0f2744]"
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
