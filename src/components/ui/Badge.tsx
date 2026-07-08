import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "gold";

const TONES: Record<Tone, string> = {
  success: "bg-success-bg text-success border-[#cfe0d2]",
  warning: "bg-warning-bg text-warning border-[#ead9b6]",
  danger: "bg-danger-bg text-danger border-[#eccdc5]",
  info: "bg-info-bg text-info border-[#d4dce8]",
  neutral: "bg-[#f2ede1] text-soft border-[#e4dcc9]",
  gold: "bg-gold-100 text-gold-600 border-gold-200",
};

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  /** Show a small leading status dot. */
  dot?: boolean;
}

export function Badge({ tone = "neutral", children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-bold",
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}
