import type { Faculty } from "@/types";
import { STUDENTS } from "./students";

/**
 * Faculty (mock). The primary faculty, Dr. Neha Agarwal, teaches Computer
 * Networks (CS-501) to CSE Sem-V — the course whose internals are entered live
 * in the faculty → student demo.
 */
export const FACULTY: Faculty[] = [
  {
    id: "IET-CS-014",
    name: "Dr. Neha Agarwal",
    department: "CSE",
    designation: "Associate Professor",
    email: "neha.agarwal@ietdavv.edu.in",
    photoColor: "#1a3a5c",
    coursesTaught: [
      { courseCode: "CS-501", title: "Computer Networks", branch: "CSE", semester: 5, section: "A" },
      { courseCode: "CS-505", title: "Computer Networks Laboratory", branch: "CSE", semester: 5, section: "A" },
    ],
    advisorOf: STUDENTS.slice(0, 6).map((s) => s.enrollmentNo),
  },
  {
    id: "IET-CS-009",
    name: "Dr. Sanjay Mehta",
    department: "CSE",
    designation: "Professor",
    email: "sanjay.mehta@ietdavv.edu.in",
    photoColor: "#c4915d",
    coursesTaught: [
      { courseCode: "CS-502", title: "Compiler Design", branch: "CSE", semester: 5, section: "A" },
      { courseCode: "CS-503", title: "Machine Learning", branch: "CSE", semester: 5, section: "A" },
    ],
    advisorOf: STUDENTS.slice(6, 12).map((s) => s.enrollmentNo),
  },
  {
    id: "IET-CS-021",
    name: "Prof. Ritu Malviya",
    department: "CSE",
    designation: "Assistant Professor",
    email: "ritu.malviya@ietdavv.edu.in",
    photoColor: "#2e7d32",
    coursesTaught: [
      { courseCode: "CS-504", title: "Web Technologies", branch: "CSE", semester: 5, section: "A" },
      { courseCode: "OE-506", title: "Open Elective — Principles of Management", branch: "CSE", semester: 5, section: "A" },
    ],
    advisorOf: [],
  },
];

export const PRIMARY_FACULTY_ID = FACULTY[0].id;

const FACULTY_BY_ID = new Map(FACULTY.map((f) => [f.id, f]));

export function getFaculty(id: string): Faculty | undefined {
  return FACULTY_BY_ID.get(id);
}

export function listFaculty(): Faculty[] {
  return FACULTY;
}
