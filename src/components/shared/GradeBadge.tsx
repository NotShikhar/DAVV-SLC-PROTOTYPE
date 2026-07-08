import type { LetterGrade } from "@/types";
import type { Tone } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";

export function gradeTone(grade: LetterGrade): Tone {
  switch (grade) {
    case "O":
    case "A+":
      return "success";
    case "A":
    case "B+":
      return "info";
    case "B":
    case "C":
      return "gold";
    case "P":
      return "warning";
    case "F":
      return "danger";
  }
}

const CHIP: Record<Tone, string> = {
  success: "bg-success-bg text-success border-[#cfe0d2]",
  warning: "bg-warning-bg text-warning border-[#ead9b6]",
  danger: "bg-danger-bg text-danger border-[#eccdc5]",
  info: "bg-info-bg text-info border-[#d4dce8]",
  neutral: "bg-[#f2ede1] text-soft border-[#e4dcc9]",
  gold: "bg-gold-100 text-gold-600 border-gold-200",
};

/** Grade chip — 34×24 rounded rectangle, tone-mapped to the CBCS scale. */
export function GradeBadge({ grade }: { grade: LetterGrade | null }) {
  const tone: Tone = grade === null ? "neutral" : gradeTone(grade);
  return (
    <span
      className={cn(
        "inline-grid h-6 w-[34px] place-items-center rounded-md border font-mono text-[11.5px] font-bold tabular-nums",
        CHIP[tone],
      )}
    >
      {grade ?? "—"}
    </span>
  );
}
