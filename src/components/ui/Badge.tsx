import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "gold";

const TONES: Record<Tone, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  neutral: "bg-cream text-slate",
  gold: "bg-gold-100 text-gold-600",
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium font-heading",
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}
