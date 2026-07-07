import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { Tone } from "@/components/ui/Badge";

const STROKE: Record<Tone, string> = {
  success: "stroke-success",
  warning: "stroke-warning",
  danger: "stroke-danger",
  info: "stroke-navy",
  neutral: "stroke-slate",
  gold: "stroke-gold",
};

interface GaugeProps {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  tone?: Tone;
  label?: ReactNode;
  sublabel?: ReactNode;
  className?: string;
}

/** Dependency-free SVG donut gauge with a centred label. */
export function Gauge({
  value,
  max = 100,
  size = 104,
  thickness = 9,
  tone = "info",
  label,
  sublabel,
  className,
}: GaugeProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;
  const center = size / 2;

  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={center} cy={center} r={r} fill="none" className="stroke-line" strokeWidth={thickness} />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          className={STROKE[tone]}
          strokeWidth={thickness}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        {label && <div className="font-heading text-lg leading-none font-bold text-navy">{label}</div>}
        {sublabel && <div className="mt-1 text-[10px] tracking-wide text-muted uppercase">{sublabel}</div>}
      </div>
    </div>
  );
}
