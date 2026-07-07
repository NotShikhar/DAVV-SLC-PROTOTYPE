import type { CourseResult, SemesterRecord, Student } from "@/types";
import { MIN_CREDITS_PER_SEM, REQUIRED_CREDITS } from "./constants";

/**
 * ============================================================================
 * CBCS credit rules & academic standing
 * ============================================================================
 */

/** Credits actually earned (passed) in a set of course results. */
export function creditsEarned(courses: CourseResult[]): number {
  return courses.filter((c) => c.status === "Pass").reduce((s, c) => s + c.credits, 0);
}

/** Credits registered (attempted) in a set of course results. */
export function creditsRegistered(courses: CourseResult[]): number {
  return courses.reduce((s, c) => s + c.credits, 0);
}

/** Total credits earned across all semesters. */
export function totalCreditsEarned(semesters: SemesterRecord[]): number {
  return semesters.reduce((sum, sem) => sum + creditsEarned(sem.courses), 0);
}

/** Failed / carried-forward (backlog / ATKT) courses across all semesters. */
export function backlogCourses(semesters: SemesterRecord[]): CourseResult[] {
  return semesters.flatMap((s) =>
    s.courses.filter((c) => c.status === "Fail" || c.status === "Backlog"),
  );
}

/** A semester is "completed" once every course has a declared status. */
function isCompleted(sem: SemesterRecord): boolean {
  return sem.courses.length > 0 && sem.courses.every((c) => c.status !== "Pending");
}

export type StandingTone = "success" | "warning" | "danger";
export interface AcademicStanding {
  label: string;
  tone: StandingTone;
  reason: string;
}

/**
 * Academic standing from completed semesters:
 *  - Zero Semester  → a completed semester earned < 12 credits (repeat required)
 *  - At Risk        → one or more unresolved backlogs
 *  - Good Standing  → otherwise
 */
export function academicStanding(student: Student): AcademicStanding {
  const completed = student.semesters.filter(isCompleted);

  const zeroSem = completed.find((s) => creditsEarned(s.courses) < MIN_CREDITS_PER_SEM);
  if (zeroSem) {
    return {
      label: "Zero Semester",
      tone: "danger",
      reason: `Semester earned fewer than ${MIN_CREDITS_PER_SEM} credits — repeat required.`,
    };
  }

  const backlogs = backlogCourses(student.semesters);
  if (backlogs.length > 0) {
    return {
      label: "At Risk",
      tone: "warning",
      reason: `${backlogs.length} backlog${backlogs.length > 1 ? "s" : ""} pending — clear via Supplementary (ATKT) exam.`,
    };
  }

  return {
    label: "Good Standing",
    tone: "success",
    reason: "On track — all attempted credits cleared.",
  };
}

export interface DegreeProgress {
  earned: number;
  required: number;
  percent: number;
}

/** Progress toward the degree's total credit requirement. */
export function degreeProgress(semesters: SemesterRecord[]): DegreeProgress {
  const earned = totalCreditsEarned(semesters);
  return {
    earned,
    required: REQUIRED_CREDITS,
    percent: Math.min(100, Math.round((earned / REQUIRED_CREDITS) * 100)),
  };
}
