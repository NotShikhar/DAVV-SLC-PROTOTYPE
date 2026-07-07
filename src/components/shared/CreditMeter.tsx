import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Tone } from "@/components/ui/Badge";

interface CreditMeterProps {
  earned: number;
  required: number;
  label?: string;
  /** Optional explicit tone; otherwise derived from the ratio. */
  tone?: Tone;
}

export function CreditMeter({ earned, required, label = "Credits earned", tone }: CreditMeterProps) {
  const pct = required === 0 ? 0 : Math.min(100, Math.round((earned / required) * 100));
  const resolvedTone: Tone = tone ?? (pct >= 66 ? "success" : pct >= 33 ? "info" : "warning");
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-heading font-semibold text-navy tabular-nums">
          {earned}
          <span className="text-muted"> / {required}</span>
        </span>
      </div>
      <ProgressBar value={pct} tone={resolvedTone} aria-label={label} />
    </div>
  );
}
