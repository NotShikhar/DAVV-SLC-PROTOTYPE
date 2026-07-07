import type {
  AttendanceRecord,
  CourseResult,
  CourseResultStatus,
  FeeRecord,
  InternalAssessment,
  SemesterRecord,
  Student,
  StudentCategory,
} from "@/types";
import { computeSGPA, gradeFromMarks } from "@/lib/domain/grades";
import { FEE_STRUCTURE } from "@/lib/domain/constants";
import { getCourse } from "./courses";

/**
 * ============================================================================
 * Student body (mock, deterministic)
 * ----------------------------------------------------------------------------
 * A CSE Semester-V class. Records are generated from a small seeded PRNG so the
 * data is realistic yet stable across reloads. Three students are hand-tuned to
 * exercise edge cases used in the demo journeys:
 *   • Aarav Sharma  — happy path, Good Standing
 *   • Priya Verma   — At-Risk: attendance below 75% (exam-registration blocked)
 *   • Rohit Yadav   — Backlog (ATKT) carried from Semester III
 * ============================================================================
 */

const ADMISSION_YEAR = 2024;
const CURRENT_SEM = 5;

// CSE scheme, course codes per semester (mirrors src/data/courses.ts).
const SEM_COURSES: Record<number, string[]> = {
  1: ["MA-101", "PH-102", "CS-103", "EE-104", "ME-105", "HS-106"],
  2: ["MA-201", "CH-202", "CS-203", "EC-204", "ME-205", "HS-206"],
  3: ["MA-301", "CS-302", "CS-303", "CS-304", "CS-305", "HS-306"],
  4: ["CS-401", "CS-402", "CS-403", "EC-404", "CS-405", "CS-406"],
  5: ["CS-501", "CS-502", "CS-503", "CS-504", "CS-505", "OE-506"],
};

/** The current-semester course whose internals faculty enter live in the demo. */
const LIVE_INTERNAL_COURSE = "CS-501";

type Tier = "topper" | "good" | "average" | "weak";

const TIER_MARKS: Record<Tier, { internal: number; external: number; mst: number; comp: number; attn: number }> = {
  topper: { internal: 18, external: 71, mst: 26, comp: 9, attn: 92 },
  good: { internal: 16, external: 61, mst: 22, comp: 8, attn: 86 },
  average: { internal: 13, external: 51, mst: 18, comp: 7, attn: 80 },
  weak: { internal: 10, external: 42, mst: 14, comp: 6, attn: 72 },
};

const PHOTO_COLORS = [
  "#1a3a5c", "#c4915d", "#2e7d32", "#6d28d9", "#0f766e", "#b45309",
  "#be123c", "#334155", "#0369a1", "#4d7c0f", "#9d174d", "#5b21b6",
];

// --- deterministic PRNG ------------------------------------------------------
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function jitter(rng: () => number, base: number, spread: number): number {
  return Math.round(base + (rng() * 2 - 1) * spread);
}
function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function sessionFor(sem: number): string {
  const odd = sem % 2 === 1;
  const year = ADMISSION_YEAR + (odd ? (sem - 1) / 2 : sem / 2);
  return odd ? `Jul–Dec ${year}` : `Jan–Jun ${year}`;
}

// --- result & semester builders ---------------------------------------------
function makeResult(code: string, internal: number | null, external: number | null): CourseResult {
  const course = getCourse(code);
  const credits = course?.credits ?? 3;
  const title = course?.title ?? code;
  const g = gradeFromMarks(internal, external);
  let status: CourseResultStatus = "Pending";
  if (g.grade !== null) status = g.grade === "F" ? "Backlog" : "Pass";
  return { courseCode: code, title, credits, internal, external, grade: g.grade, gradePoint: g.point, status };
}

interface Narrative {
  /** Force a backlog on a course in a given semester (e.g. Rohit in Sem III). */
  backlog?: { semester: number; courseCode: string };
}

function buildHistory(tier: Tier, seed: number, narrative: Narrative): SemesterRecord[] {
  const rng = mulberry32(seed);
  const m = TIER_MARKS[tier];
  const records: SemesterRecord[] = [];

  for (let sem = 1; sem < CURRENT_SEM; sem++) {
    const results = SEM_COURSES[sem].map((code) => {
      let internal = clamp(jitter(rng, m.internal, 2), 5, 20);
      let external = clamp(jitter(rng, m.external, 8), 26, 80);
      if (narrative.backlog && narrative.backlog.semester === sem && narrative.backlog.courseCode === code) {
        internal = 9;
        external = 22; // total 31 → F → Backlog
      }
      return makeResult(code, internal, external);
    });
    records.push({ semester: sem, session: sessionFor(sem), courses: results, sgpa: computeSGPA(results) });
  }
  return records;
}

function buildAttendance(tier: Tier, seed: number, attnOverride?: number): AttendanceRecord[] {
  const rng = mulberry32(seed + 991);
  const attn = attnOverride ?? TIER_MARKS[tier].attn;
  return SEM_COURSES[CURRENT_SEM].map((code) => {
    const isLab = getCourse(code)?.category === "Laboratory";
    const held = isLab ? 14 : 44;
    const attended = clamp(Math.round((held * attn) / 100) + jitter(rng, 0, 1), 0, held);
    return { courseCode: code, title: getCourse(code)?.title ?? code, attended, held };
  });
}

function buildInternals(tier: Tier, seed: number): InternalAssessment[] {
  const rng = mulberry32(seed + 7);
  const m = TIER_MARKS[tier];
  return SEM_COURSES[CURRENT_SEM].map((code) => {
    const inProgress = code === LIVE_INTERNAL_COURSE; // faculty enters MST-2 live
    const mst1 = clamp(jitter(rng, m.mst, 3), 0, 30);
    const mst2 = inProgress ? null : clamp(jitter(rng, m.mst, 3), 0, 30);
    const assignment = clamp(jitter(rng, m.comp, 1), 0, 10);
    const quiz = inProgress ? null : clamp(jitter(rng, m.comp, 1), 0, 10);
    let total: number | null = null;
    if (mst2 !== null && quiz !== null) {
      const bestMst = Math.max(mst1, mst2);
      total = clamp(Math.round((bestMst / 30) * 10 + (assignment / 10) * 5 + (quiz / 10) * 5), 0, 20);
    }
    return { courseCode: code, title: getCourse(code)?.title ?? code, mst1, mst2, assignment, quiz, total, locked: !inProgress };
  });
}

function buildCurrentSemesterRecord(internals: InternalAssessment[]): SemesterRecord {
  const courses: CourseResult[] = SEM_COURSES[CURRENT_SEM].map((code) => {
    const ia = internals.find((i) => i.courseCode === code);
    return makeResult(code, ia?.total ?? null, null); // external not yet declared
  });
  return { semester: CURRENT_SEM, session: sessionFor(CURRENT_SEM), courses, sgpa: null };
}

function buildFees(seed: number): FeeRecord[] {
  const fees: FeeRecord[] = [];
  for (let sem = 1; sem <= CURRENT_SEM; sem++) {
    const paid = sem < CURRENT_SEM;
    const year = ADMISSION_YEAR + Math.floor((sem - 1) / 2);
    fees.push({
      id: `fee-${sem}-tuition`,
      semester: sem,
      head: "Tuition",
      amount: FEE_STRUCTURE.tuitionPerSemester,
      status: "Paid", // tuition kept paid so exam fee is the live "Due" item
      paidOn: `${year}-0${sem % 2 === 1 ? 8 : 2}-12`,
      receiptNo: `MPO/${year}/${100000 + seed * 7 + sem}`,
    });
    fees.push({
      id: `fee-${sem}-exam`,
      semester: sem,
      head: "Examination",
      amount: FEE_STRUCTURE.examPerSemester,
      status: paid ? "Paid" : "Due",
      dueDate: paid ? undefined : "2026-10-10",
      paidOn: paid ? `${year}-1${sem % 2 === 1 ? 1 : 0}-05` : undefined,
      receiptNo: paid ? `MPO/${year}/${200000 + seed * 7 + sem}` : undefined,
    });
  }
  return fees;
}

// --- profiles ----------------------------------------------------------------
interface Profile {
  serial: number;
  name: string;
  gender: Student["gender"];
  dob: string;
  category: StudentCategory;
  tier: Tier;
  attnOverride?: number;
  narrative?: Narrative;
  scholarshipStatus?: Student["scholarship"]["status"];
}

const PROFILES: Profile[] = [
  { serial: 42, name: "Aarav Sharma", gender: "Male", dob: "2006-03-14", category: "General", tier: "good" },
  { serial: 43, name: "Priya Verma", gender: "Female", dob: "2006-07-22", category: "OBC", tier: "average", attnOverride: 62, scholarshipStatus: "Sanctioned" },
  { serial: 44, name: "Rohit Yadav", gender: "Male", dob: "2005-11-02", category: "SC", tier: "weak", narrative: { backlog: { semester: 3, courseCode: "CS-304" } }, scholarshipStatus: "Disbursed" },
  { serial: 45, name: "Ananya Iyer", gender: "Female", dob: "2006-01-19", category: "General", tier: "topper" },
  { serial: 46, name: "Kabir Khan", gender: "Male", dob: "2006-05-08", category: "General", tier: "good" },
  { serial: 47, name: "Sneha Nair", gender: "Female", dob: "2006-09-30", category: "OBC", tier: "average", scholarshipStatus: "Applied" },
  { serial: 48, name: "Devansh Jain", gender: "Male", dob: "2006-02-27", category: "EWS", tier: "good", scholarshipStatus: "Sanctioned" },
  { serial: 49, name: "Ishita Gupta", gender: "Female", dob: "2006-06-11", category: "General", tier: "topper" },
  { serial: 50, name: "Aditya Rao", gender: "Male", dob: "2005-12-24", category: "General", tier: "average" },
  { serial: 51, name: "Meera Joshi", gender: "Female", dob: "2006-04-05", category: "OBC", tier: "good", scholarshipStatus: "Disbursed" },
  { serial: 52, name: "Arjun Singh", gender: "Male", dob: "2006-08-17", category: "ST", tier: "weak", scholarshipStatus: "Sanctioned" },
  { serial: 53, name: "Nisha Chouhan", gender: "Female", dob: "2006-10-09", category: "SC", tier: "average", scholarshipStatus: "Applied" },
];

function firstName(name: string): string {
  return name.split(" ")[0];
}

function buildStudent(p: Profile, index: number): Student {
  const enrollmentNo = `DE24CS${String(p.serial).padStart(4, "0")}`;
  const semesters = buildHistory(p.tier, p.serial, p.narrative ?? {});
  const internals = buildInternals(p.tier, p.serial);
  const attendance = buildAttendance(p.tier, p.serial, p.attnOverride);
  semesters.push(buildCurrentSemesterRecord(internals));

  return {
    enrollmentNo,
    rollNo: `IET/CS/24/${String(p.serial).padStart(3, "0")}`,
    name: p.name,
    dob: p.dob,
    gender: p.gender,
    email: `${firstName(p.name).toLowerCase()}.cs24@ietdavv.edu.in`,
    phone: `+91 9${String(800000000 + p.serial * 111347).slice(0, 9)}`,
    branch: "CSE",
    section: "A",
    admissionYear: ADMISSION_YEAR,
    currentSemester: CURRENT_SEM,
    category: p.category,
    quota: p.category === "General" ? "Home State (MP)" : "Home State (MP)",
    aadhaarLast4: String(1000 + ((p.serial * 37) % 9000)),
    address: {
      line1: `${p.serial}, Scheme No. ${54 + (p.serial % 40)}`,
      city: "Indore",
      state: "Madhya Pradesh",
      pincode: `4520${String(p.serial % 100).padStart(2, "0")}`,
    },
    guardians: [
      { name: `Mr. ${p.name.split(" ")[1]}`, relation: "Father", phone: `+91 9${String(700000000 + p.serial * 91237).slice(0, 9)}`, occupation: "Business" },
      { name: `Mrs. ${p.name.split(" ")[1]}`, relation: "Mother", phone: `+91 9${String(600000000 + p.serial * 71129).slice(0, 9)}`, occupation: "Homemaker" },
    ],
    photoColor: PHOTO_COLORS[index % PHOTO_COLORS.length],
    admission: {
      allotmentNo: `DTE/2024/${500000 + p.serial}`,
      jeeRank: 12000 + p.serial * 173,
      counsellingRound: 1 + (p.serial % 2),
      documents: [
        { name: "DTE Allotment Letter", verified: true },
        { name: "JEE Main Scorecard", verified: true },
        { name: "Class X Marksheet", verified: true },
        { name: "Class XII Marksheet", verified: true },
        { name: "Migration Certificate", verified: true },
        { name: "Domicile Certificate (MP)", verified: true },
        { name: "Category Certificate", verified: p.category !== "General" },
      ],
      admissionConfirmed: true,
      feePaid: true,
    },
    scholarship: {
      scheme:
        p.category === "General"
          ? "—"
          : "MP Post-Matric Scholarship (SC/ST/OBC) 2.0",
      status: p.scholarshipStatus ?? (p.category === "General" ? "Not Applied" : "Applied"),
    },
    semesters,
    attendance,
    internals,
    fees: buildFees(p.serial),
  };
}

export const STUDENTS: Student[] = PROFILES.map(buildStudent);

/** Default student surfaced on the login screen for a quick demo. */
export const PRIMARY_STUDENT_ID = STUDENTS[0].enrollmentNo;

const STUDENT_BY_ID = new Map(STUDENTS.map((s) => [s.enrollmentNo, s]));

export function getStudent(enrollmentNo: string): Student | undefined {
  return STUDENT_BY_ID.get(enrollmentNo);
}

export function listStudents(): Student[] {
  return STUDENTS;
}

/** Class roster for a given course (all CSE Sem-V, section A in this prototype). */
export function studentsForCourse(courseCode: string): Student[] {
  return STUDENTS.filter((s) => s.internals.some((i) => i.courseCode === courseCode));
}
