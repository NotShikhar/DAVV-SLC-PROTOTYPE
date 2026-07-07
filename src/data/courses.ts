import type { Course } from "@/types";

/**
 * ============================================================================
 * Course catalogue (mock)
 * ----------------------------------------------------------------------------
 * A coherent B.E. Computer Science & Engineering scheme for semesters I–V under
 * CBCS, plus a few Open Electives and sample courses from other branches. Codes,
 * titles and credits are representative of a DAVV/IET scheme.
 * ============================================================================
 */

export const COURSES: Course[] = [
  // ---- CSE · Semester I (Jul–Dec) ------------------------------------------
  { code: "MA-101", title: "Engineering Mathematics-I", credits: 4, category: "Core", branch: "ALL", semester: 1 },
  { code: "PH-102", title: "Engineering Physics", credits: 4, category: "Core", branch: "ALL", semester: 1 },
  { code: "CS-103", title: "Programming for Problem Solving (C)", credits: 4, category: "Core", branch: "CSE", semester: 1,
    courseOutcomes: ["Apply structured programming constructs", "Design modular C programs", "Use arrays, pointers and files"] },
  { code: "EE-104", title: "Basic Electrical Engineering", credits: 3, category: "Core", branch: "ALL", semester: 1 },
  { code: "ME-105", title: "Engineering Graphics Lab", credits: 2, category: "Laboratory", branch: "ALL", semester: 1 },
  { code: "HS-106", title: "Communication Skills", credits: 2, category: "Ability Enhancement", branch: "ALL", semester: 1 },

  // ---- CSE · Semester II (Jan–Jun) -----------------------------------------
  { code: "MA-201", title: "Engineering Mathematics-II", credits: 4, category: "Core", branch: "ALL", semester: 2 },
  { code: "CH-202", title: "Engineering Chemistry", credits: 4, category: "Core", branch: "ALL", semester: 2 },
  { code: "CS-203", title: "Data Structures", credits: 4, category: "Core", branch: "CSE", semester: 2,
    courseOutcomes: ["Analyse time/space complexity", "Implement linear & non-linear structures", "Apply searching & sorting"] },
  { code: "EC-204", title: "Digital Electronics", credits: 3, category: "Core", branch: "ALL", semester: 2 },
  { code: "ME-205", title: "Workshop Practice", credits: 2, category: "Laboratory", branch: "ALL", semester: 2 },
  { code: "HS-206", title: "Environmental Studies", credits: 2, category: "Ability Enhancement", branch: "ALL", semester: 2 },

  // ---- CSE · Semester III (Jul–Dec) ----------------------------------------
  { code: "MA-301", title: "Discrete Mathematics", credits: 4, category: "Core", branch: "CSE", semester: 3 },
  { code: "CS-302", title: "Object-Oriented Programming (Java)", credits: 4, category: "Core", branch: "CSE", semester: 3 },
  { code: "CS-303", title: "Computer Organization & Architecture", credits: 4, category: "Core", branch: "CSE", semester: 3 },
  { code: "CS-304", title: "Database Management Systems", credits: 4, category: "Core", branch: "CSE", semester: 3,
    courseOutcomes: ["Design normalised schemas", "Write SQL & relational algebra", "Reason about transactions"] },
  { code: "CS-305", title: "OOP Laboratory", credits: 1, category: "Laboratory", branch: "CSE", semester: 3 },
  { code: "HS-306", title: "Universal Human Values", credits: 2, category: "Ability Enhancement", branch: "ALL", semester: 3 },

  // ---- CSE · Semester IV (Jan–Jun) -----------------------------------------
  { code: "CS-401", title: "Design & Analysis of Algorithms", credits: 4, category: "Core", branch: "CSE", semester: 4,
    courseOutcomes: ["Apply divide-and-conquer & DP", "Prove correctness & bounds", "Recognise NP-hard problems"] },
  { code: "CS-402", title: "Operating Systems", credits: 4, category: "Core", branch: "CSE", semester: 4 },
  { code: "CS-403", title: "Theory of Computation", credits: 3, category: "Core", branch: "CSE", semester: 4 },
  { code: "EC-404", title: "Microprocessors & Interfacing", credits: 3, category: "Core", branch: "CSE", semester: 4 },
  { code: "CS-405", title: "DBMS Laboratory", credits: 1, category: "Laboratory", branch: "CSE", semester: 4 },
  { code: "CS-406", title: "Software Engineering", credits: 3, category: "Core", branch: "CSE", semester: 4 },

  // ---- CSE · Semester V (Jul–Dec) — current --------------------------------
  { code: "CS-501", title: "Computer Networks", credits: 4, category: "Core", branch: "CSE", semester: 5,
    courseOutcomes: ["Explain the TCP/IP stack", "Analyse routing & congestion control", "Configure basic networks"] },
  { code: "CS-502", title: "Compiler Design", credits: 4, category: "Core", branch: "CSE", semester: 5 },
  { code: "CS-503", title: "Machine Learning", credits: 3, category: "Program Elective", branch: "CSE", semester: 5,
    courseOutcomes: ["Frame supervised/unsupervised tasks", "Train & evaluate models", "Reason about bias–variance"] },
  { code: "CS-504", title: "Web Technologies", credits: 3, category: "Program Elective", branch: "CSE", semester: 5 },
  { code: "CS-505", title: "Computer Networks Laboratory", credits: 1, category: "Laboratory", branch: "CSE", semester: 5 },
  { code: "OE-506", title: "Open Elective — Principles of Management", credits: 3, category: "Open Elective", branch: "ALL", semester: 5 },

  // ---- Open Electives basket (Semester V) ----------------------------------
  { code: "OE-511", title: "Open Elective — Introduction to Psychology", credits: 3, category: "Open Elective", branch: "ALL", semester: 5 },
  { code: "OE-512", title: "Open Elective — Financial Literacy", credits: 3, category: "Open Elective", branch: "ALL", semester: 5 },
  { code: "OE-513", title: "Open Elective — Renewable Energy Systems", credits: 3, category: "Open Elective", branch: "ALL", semester: 5 },

  // ---- Program Electives basket (Semester V) -------------------------------
  { code: "CS-521", title: "Program Elective — Cyber Security", credits: 3, category: "Program Elective", branch: "CSE", semester: 5 },
  { code: "CS-522", title: "Program Elective — Cloud Computing", credits: 3, category: "Program Elective", branch: "CSE", semester: 5 },

  // ---- Sample courses from other branches (for catalogue browsing) ---------
  { code: "IT-501", title: "Information Security", credits: 4, category: "Core", branch: "IT", semester: 5 },
  { code: "ETC-501", title: "Digital Communication", credits: 4, category: "Core", branch: "ETC", semester: 5 },
  { code: "ME-501", title: "Heat & Mass Transfer", credits: 4, category: "Core", branch: "ME", semester: 5 },
];

const BY_CODE = new Map(COURSES.map((c) => [c.code, c]));

export function getCourse(code: string): Course | undefined {
  return BY_CODE.get(code);
}

export function coursesForBranchSemester(
  branch: Course["branch"],
  semester: number,
): Course[] {
  return COURSES.filter(
    (c) => (c.branch === branch || c.branch === "ALL") && c.semester === semester,
  );
}
