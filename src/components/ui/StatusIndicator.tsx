import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import type { Tone } from "@/components/ui/Badge";

const TONE: Record<Tone, { fill: string; halo: string }> = {
  success: { fill: "bg-success text-white", halo: "bg-success" },
  warning: { fill: "bg-warning text-white", halo: "bg-warning" },
  danger: { fill: "bg-danger text-white", halo: "bg-danger" },
  info: { fill: "bg-navy text-gold-bright", halo: "bg-navy" },
  neutral: { fill: "bg-muted text-white", halo: "bg-muted" },
  gold: { fill: "bg-gold text-navy", halo: "bg-gold" },
};

const DOT_SIZE = {
  sm: "size-1.5",
  md: "size-2.5",
};

interface StatusIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /** Renders a numeric pill (e.g. unread count) instead of a bare dot. */
  count?: number;
  /** Soft expanding halo — three beats, then rests. */
  pulse?: boolean;
  size?: keyof typeof DOT_SIZE;
}

/**
 * Live-status dot with an expanding halo. Adapted from Watermelon UI's
 * `status-indicator` (ui.watermelon.sh), remapped onto the shared Tone set
 * with the halo limited to three beats so it draws the eye without nagging.
 */
export function StatusIndicator({
  tone = "gold",
  count,
  pulse = true,
  size = "sm",
  className,
  ...props
}: StatusIndicatorProps) {
  return (
    <span className={cn("relative inline-flex", className)} {...props}>
      {pulse && (
        <span
          aria-hidden
          className={cn("animate-ping-soft absolute inset-0 rounded-full", TONE[tone].halo)}
        />
      )}
      {count != null ? (
        <span
          className={cn(
            "relative grid min-w-4 place-items-center rounded-full px-1 text-[10px] font-semibold",
            TONE[tone].fill,
          )}
        >
          {count}
        </span>
      ) : (
        <span className={cn("relative rounded-full", DOT_SIZE[size], TONE[tone].halo)} />
      )}
    </span>
  );
}
