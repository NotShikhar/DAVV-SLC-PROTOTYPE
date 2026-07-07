import type { LetterGrade } from "@/types";
import { Badge, type Tone } from "@/components/ui/Badge";

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

export function GradeBadge({ grade }: { grade: LetterGrade | null }) {
  if (grade === null) {
    return (
      <Badge tone="neutral" className="w-9 justify-center">
        —
      </Badge>
    );
  }
  return (
    <Badge tone={gradeTone(grade)} className="w-9 justify-center tabular-nums">
      {grade}
    </Badge>
  );
}
