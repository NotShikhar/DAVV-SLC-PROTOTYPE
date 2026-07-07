import type { CourseResult, LetterGrade, SemesterRecord } from "@/types";
import { EXTERNAL_MAX, GRADE_SCALE, INTERNAL_MAX } from "./constants";

/**
 * ============================================================================
 * Grading — CBCS 10-point scale
 * ----------------------------------------------------------------------------
 * ⚠︎ DAVV does not publish its exact SGPA/CGPA formula. We implement the
 * standard UGC credit-weighted formula:
 *      SGPA = Σ(gradePoint × credits) / Σ(credits)
 * across graded courses, and CGPA the same way across all completed semesters.
 * ============================================================================
 */

export const MAX_TOTAL = INTERNAL_MAX + EXTERNAL_MAX; // 100

/** Grade point (0–10) for a letter grade. */
export function gradePoint(letter: LetterGrade): number {
  return GRADE_SCALE.find((g) => g.letter === letter)?.point ?? 0;
}

/** Human label for a letter grade, e.g. "A+" → "Excellent". */
export function gradeLabel(letter: LetterGrade): string {
  return GRADE_SCALE.find((g) => g.letter === letter)?.label ?? "";
}

/** Map a total mark (out of 100) to its letter grade. */
export function letterFromTotal(total: number): LetterGrade {
  const clamped = Math.max(0, Math.min(MAX_TOTAL, total));
  return GRADE_SCALE.find((g) => clamped >= g.min && clamped <= g.max)?.letter ?? "F";
}

/** Derive letter + point from an internal/external split (either may be null). */
export function gradeFromMarks(
  internal: number | null,
  external: number | null,
): { total: number | null; grade: LetterGrade | null; point: number | null } {
  if (internal === null || external === null) {
    return { total: null, grade: null, point: null };
  }
  const total = internal + external;
  const grade = letterFromTotal(total);
  return { total, grade, point: gradePoint(grade) };
}

/** Only courses with a declared grade count toward GPA. */
function graded(courses: CourseResult[]): CourseResult[] {
  return courses.filter((c) => c.grade !== null && c.gradePoint !== null);
}

/** Credit-weighted SGPA for a set of course results (null if none graded). */
export function computeSGPA(courses: CourseResult[]): number | null {
  const g = graded(courses);
  const totalCredits = g.reduce((s, c) => s + c.credits, 0);
  if (totalCredits === 0) return null;
  const weighted = g.reduce((s, c) => s + (c.gradePoint as number) * c.credits, 0);
  return round2(weighted / totalCredits);
}

/** Credit-weighted CGPA across all completed semesters (null if none graded). */
export function computeCGPA(semesters: SemesterRecord[]): number | null {
  const all = semesters.flatMap((s) => graded(s.courses));
  const totalCredits = all.reduce((s, c) => s + c.credits, 0);
  if (totalCredits === 0) return null;
  const weighted = all.reduce((s, c) => s + (c.gradePoint as number) * c.credits, 0);
  return round2(weighted / totalCredits);
}

/**
 * Consolidated internal (out of 20) from raw components:
 *   best of two MSTs (→ 10) + assignment (→ 5) + quiz (→ 5).
 * Returns null while any component is still pending. Shared by seed data and
 * the faculty marks-entry flow so both compute identically.
 */
export function internalTotal(
  mst1: number | null,
  mst2: number | null,
  assignment: number | null,
  quiz: number | null,
): number | null {
  if (mst1 === null || mst2 === null || assignment === null || quiz === null) return null;
  const bestMst = Math.max(mst1, mst2);
  const total = (bestMst / 30) * 10 + (assignment / 10) * 5 + (quiz / 10) * 5;
  return Math.max(0, Math.min(20, Math.round(total)));
}

/** DAVV division from CGPA (used on transcripts / degree audit). */
export function classification(cgpa: number | null): string {
  if (cgpa === null) return "—";
  if (cgpa >= 7.5) return "First Division with Distinction";
  if (cgpa >= 6.5) return "First Division";
  if (cgpa >= 5.5) return "Second Division";
  if (cgpa >= 4.0) return "Pass Division";
  return "Fail";
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
