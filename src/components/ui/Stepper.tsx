import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StepperProps {
  steps: string[];
  /** Index of the current step (0-based). Steps before it render as complete. */
  current: number;
}

/** Horizontal progress stepper — used for certificate request tracking. */
export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex items-center">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className={cn("flex items-center", i < steps.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full border-2 text-xs font-semibold transition-colors",
                  done && "border-success bg-success text-white",
                  active && "border-navy bg-navy text-white",
                  !done && !active && "border-line bg-surface text-muted",
                )}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "max-w-24 text-[11px] leading-tight",
                  active ? "font-semibold text-navy" : "text-muted",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("mx-1 h-0.5 flex-1 rounded", i < current ? "bg-success" : "bg-line")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
