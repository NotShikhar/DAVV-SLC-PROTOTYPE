import type { AttendanceRecord, Student } from "@/types";
import { ATTENDANCE_THRESHOLD, INTERNAL_PASS_MARK } from "./constants";

/**
 * ============================================================================
 * Exam eligibility — DAVV requires ≥ 75% attendance (per course AND aggregate)
 * plus passing internal (continuous assessment) marks to sit the end-sem exam.
 * ============================================================================
 */

/** Attendance percentage for one course, rounded to 1 dp. */
export function attendancePercent(rec: AttendanceRecord): number {
  return rec.held === 0 ? 0 : round1((rec.attended / rec.held) * 100);
}

/** Aggregate attendance across all current-semester courses. */
export function aggregateAttendance(records: AttendanceRecord[]): number {
  const held = records.reduce((s, r) => s + r.held, 0);
  const attended = records.reduce((s, r) => s + r.attended, 0);
  return held === 0 ? 0 : round1((attended / held) * 100);
}

export interface CourseEligibility {
  courseCode: string;
  title: string;
  attendance: number;
  /** Consolidated internal (out of 20), or null while assessment is in progress. */
  internal: number | null;
  eligible: boolean;
  reasons: string[];
}

/** Per-course eligibility combining attendance and internal marks. */
export function courseEligibility(student: Student, courseCode: string): CourseEligibility {
  const att = student.attendance.find((a) => a.courseCode === courseCode);
  const ia = student.internals.find((i) => i.courseCode === courseCode);
  const attendance = att ? attendancePercent(att) : 0;
  const internal = ia?.total ?? null;

  const reasons: string[] = [];
  if (attendance < ATTENDANCE_THRESHOLD) {
    reasons.push(`Attendance ${attendance}% is below ${ATTENDANCE_THRESHOLD}%.`);
  }
  if (internal !== null && internal < INTERNAL_PASS_MARK) {
    reasons.push(`Internal ${internal}/20 is below the pass mark (${INTERNAL_PASS_MARK}).`);
  }

  return {
    courseCode,
    title: att?.title ?? ia?.title ?? courseCode,
    attendance,
    internal,
    eligible: reasons.length === 0,
    reasons,
  };
}

export type EligibilityStatus = "Eligible" | "At Risk" | "Detained";

export interface ExamEligibility {
  status: EligibilityStatus;
  aggregate: number;
  courses: CourseEligibility[];
}

/**
 * Overall end-semester exam eligibility:
 *  - Detained → aggregate attendance below 75%
 *  - At Risk  → aggregate OK but one or more courses fail the check
 *  - Eligible → every course clears attendance + internal
 */
export function examEligibility(student: Student): ExamEligibility {
  const aggregate = aggregateAttendance(student.attendance);
  const courses = student.attendance.map((a) => courseEligibility(student, a.courseCode));

  let status: EligibilityStatus = "Eligible";
  if (aggregate < ATTENDANCE_THRESHOLD) {
    status = "Detained";
  } else if (courses.some((c) => !c.eligible)) {
    status = "At Risk";
  }

  return { status, aggregate, courses };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
