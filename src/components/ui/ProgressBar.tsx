import { cn } from "@/lib/utils/cn";
import type { Tone } from "./Badge";

const FILL: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-navy",
  neutral: "bg-slate",
  gold: "bg-gold",
};

interface ProgressBarProps {
  value: number; // 0–100
  tone?: Tone;
  className?: string;
  "aria-label"?: string;
}

export function ProgressBar({ value, tone = "info", className, ...aria }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-line", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      {...aria}
    >
      <div className={cn("h-full rounded-full transition-all", FILL[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}
