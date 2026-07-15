/**
 * Mock data layer — the single import surface for all seeded data and typed
 * accessors. Screens read from here (never poke at raw arrays directly), so a
 * real API can later replace these functions without touching the UI.
 */
export { COURSES, getCourse, coursesForBranchSemester } from "./courses";
export {
  STUDENTS,
  PRIMARY_STUDENT_ID,
  getStudent,
  listStudents,
  studentsForCourse,
} from "./students";
export { FACULTY, PRIMARY_FACULTY_ID, getFaculty, listFaculty } from "./faculty";
export { ADMINS, PRIMARY_ADMIN_ID, getAdmin, listAdmins } from "./admins";
export { NOTIFICATIONS } from "./notifications";
export { SEED_CERTIFICATE_REQUESTS } from "./certificates";
export { CALENDAR, upcomingEvents } from "./calendar";
export {
  ELIGIBLE_CANDIDATES,
  PRIMARY_ELIGIBLE_ROLL,
  getEligibleCandidate,
  listEligibleCandidates,
  matchEligible,
} from "./eligibleCandidates";
export {
  ADMISSION_INCHARGES,
  PRIMARY_INCHARGE_ID,
  getIncharge,
  listIncharges,
} from "./admissionIncharges";
export { SEED_ADMISSION_APPLICATIONS } from "./admissionApplications";

/** A representative "today" for this prototype (Semester V has just begun). */
export const TODAY_ISO = "2026-07-07";
