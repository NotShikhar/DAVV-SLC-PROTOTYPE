import { cn } from "@/lib/utils/cn";

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
}

/** Dependency-free SVG sparkline. Colour follows `currentColor` (set via text-*). */
export function Sparkline({ values, width = 132, height = 40, className }: SparklineProps) {
  if (values.length === 0) return null;
  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const n = values.length;
  const x = (i: number) => pad + (i * (width - 2 * pad)) / Math.max(1, n - 1);
  const y = (v: number) => pad + (height - 2 * pad) * (1 - (v - min) / range);
  const line = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `${x(0)},${height - pad} ${line} ${x(n - 1)},${height - pad}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("text-navy", className)}
      role="img"
      aria-label={`Trend across ${n} points, latest ${values[n - 1]}`}
    >
      <polygon points={area} fill="currentColor" opacity={0.08} />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={x(n - 1)} cy={y(values[n - 1])} r={2.6} fill="currentColor" />
    </svg>
  );
}
