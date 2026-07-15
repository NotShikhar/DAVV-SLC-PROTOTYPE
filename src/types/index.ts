/**
 * ============================================================================
 * Domain models — DAVV IET Student Lifecycle
 * ----------------------------------------------------------------------------
 * These interfaces are the single source of truth for the shape of all data in
 * the prototype. Copy in the UI must use DAVV's real terminology (Enrollment
 * Number, CBCS credits, MST, SGPA/CGPA, Supplementary/ATKT, Bonafide, ...).
 * See docs/GLOSSARY.md for the terminology reference.
 * ============================================================================
 */

/* ------------------------------------------------------------------ Common */

export type Role = "student" | "faculty" | "admin";

/** IET B.E. branch codes (9 branches offered by IET DAVV). */
export type BranchCode =
  | "CSE"
  | "IT"
  | "ETC"
  | "ME"
  | "CE"
  | "EI"
  | "CSBS"
  | "IPE"
  | "EEE";

export interface Branch {
  code: BranchCode;
  /** Full name, e.g. "Computer Science & Engineering". */
  name: string;
  /** Sanctioned intake seats. */
  intake: number;
}

export type StudentCategory = "General" | "OBC" | "SC" | "ST" | "EWS";

export type AdmissionQuota = "Home State (MP)" | "Other State" | "NRI / Management";

/* ---------------------------------------------------------------- Academics */

/** CBCS course buckets used by DAVV. */
export type CourseCategory =
  | "Core"
  | "Program Elective"
  | "Open Elective"
  | "Skill Enhancement"
  | "Ability Enhancement"
  | "Laboratory"
  | "Project";

export interface Course {
  /** e.g. "CS-301". */
  code: string;
  title: string;
  credits: number;
  category: CourseCategory;
  /** Owning branch, or "ALL" for open/common courses. */
  branch: BranchCode | "ALL";
  /** Semester in which the course is normally offered. */
  semester: number;
  /** Course Outcomes (NBA/OBE) — shown in the course detail view. */
  courseOutcomes?: string[];
  syllabusUrl?: string;
}

/** UGC 10-point letter grades used under DAVV's CBCS scheme. */
export type LetterGrade = "O" | "A+" | "A" | "B+" | "B" | "C" | "P" | "F";

export type CourseResultStatus = "Pass" | "Fail" | "Pending" | "Backlog";

/** A single course's outcome within a completed/ongoing semester. */
export interface CourseResult {
  courseCode: string;
  title: string;
  credits: number;
  /** Internal assessment, out of 20 (null = not yet finalised). */
  internal: number | null;
  /** End-semester external exam, out of 80 (null = not yet declared). */
  external: number | null;
  grade: LetterGrade | null;
  gradePoint: number | null;
  status: CourseResultStatus;
}

export interface SemesterRecord {
  semester: number;
  /** Human session label, e.g. "Jul–Dec 2024". */
  session: string;
  courses: CourseResult[];
  /** Semester GPA (credit-weighted). Undefined while results are pending. */
  sgpa?: number | null;
}

/** Current-semester attendance for exam-eligibility checks (75% rule). */
export interface AttendanceRecord {
  courseCode: string;
  title: string;
  attended: number;
  held: number;
}

/** Continuous internal assessment components for a current-semester course. */
export interface InternalAssessment {
  courseCode: string;
  title: string;
  /** Mid-Semester Test scores (out of 30 each, best-of used). */
  mst1: number | null;
  mst2: number | null;
  /** Assignment + quiz components (out of 10 each). */
  assignment: number | null;
  quiz: number | null;
  /** Consolidated internal, scaled to 20. Null while assessment is in progress. */
  total: number | null;
  locked: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO
  type: "exam" | "registration" | "result" | "fee" | "holiday" | "class" | "form";
  detail?: string;
}

/* ------------------------------------------------------------------- People */

export interface Guardian {
  name: string;
  relation: "Father" | "Mother" | "Guardian";
  phone: string;
  occupation?: string;
}

export interface Address {
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

/** Admission (DTE-MP counselling) onboarding state. */
export interface AdmissionInfo {
  /** DTE Madhya Pradesh seat-allotment letter number. */
  allotmentNo: string;
  jeeRank?: number;
  counsellingRound: number;
  documents: { name: string; verified: boolean }[];
  admissionConfirmed: boolean;
  feePaid: boolean;
}

export type ScholarshipStatus = "Not Applied" | "Applied" | "Sanctioned" | "Disbursed";

export interface Scholarship {
  scheme: string;
  status: ScholarshipStatus;
}

export type FeeHead = "Tuition" | "Examination" | "Hostel" | "Fine" | "Registration";
export type FeeStatus = "Paid" | "Due" | "Partial";

export interface FeeRecord {
  id: string;
  semester: number;
  head: FeeHead;
  amount: number;
  status: FeeStatus;
  dueDate?: string;
  paidOn?: string;
  receiptNo?: string;
}

export interface Student {
  /** Primary identity — DAVV login is Enrollment Number + Date of Birth. */
  enrollmentNo: string;
  rollNo: string;
  name: string;
  /** ISO date; used together with enrollmentNo for the mock login. */
  dob: string;
  gender: "Male" | "Female" | "Other";
  email: string;
  phone: string;
  branch: BranchCode;
  section: string;
  admissionYear: number;
  currentSemester: number;
  category: StudentCategory;
  quota: AdmissionQuota;
  aadhaarLast4: string;
  address: Address;
  guardians: Guardian[];
  photoColor: string; // avatar accent (no external images in a static build)

  admission: AdmissionInfo;
  scholarship: Scholarship;

  /** Completed + ongoing semester result records. */
  semesters: SemesterRecord[];
  /** Current-semester attendance. */
  attendance: AttendanceRecord[];
  /** Current-semester internal assessment. */
  internals: InternalAssessment[];
  fees: FeeRecord[];
}

export interface FacultyCourseLoad {
  courseCode: string;
  title: string;
  branch: BranchCode;
  semester: number;
  section: string;
}

export interface Faculty {
  /** Employee ID — faculty login credential. */
  id: string;
  name: string;
  department: BranchCode;
  designation: string;
  email: string;
  photoColor: string;
  coursesTaught: FacultyCourseLoad[];
  /** Enrollment numbers of advisees (faculty-advisor scheme). */
  advisorOf: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  role: Role;
  adminRole: AdminRole;
  email: string;
  photoColor: string;
  active: boolean;
}

/* ------------------------------------------------- Services & communication */

export type NotificationKind =
  | "deadline"
  | "result"
  | "warning"
  | "fee"
  | "exam"
  | "info";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  date: string; // ISO
  read: boolean;
  href?: string;
}

/** The eight certificates issued via DAVV's Counter-Base Application portal. */
export type CertificateType =
  | "Bonafide"
  | "Character"
  | "No-Dues"
  | "Migration"
  | "Transcript"
  | "Duplicate Marksheet"
  | "Provisional"
  | "Degree";

export type CertificateStatus =
  | "Submitted"
  | "Under Review"
  | "Ready for Collection"
  | "Issued";

export interface CertificateRequest {
  id: string;
  type: CertificateType;
  requestedOn: string; // ISO
  status: CertificateStatus;
  copies: number;
  purpose: string;
  delivery: "Collect at Counter" | "Speed Post";
}

/** Per-semester exam-form submission → hall ticket. */
export interface ExamRegistration {
  semester: number;
  windowOpen: string; // ISO
  windowClose: string; // ISO
  /** Course codes the student has confirmed for the end-semester exam. */
  registeredCourses: string[];
  submitted: boolean;
  hallTicketNo?: string;
}

/* --------------------------------------------------- Admin roles & platform */

/** Sub-roles within the Admin portal, each with a different default remit. */
export type AdminRole = "super" | "registrar" | "exam" | "accounts" | "dept";

/** Granular admin capabilities, gated across the admin portal. */
export type Permission =
  | "students.view"
  | "students.manage"
  | "students.import"
  | "faculty.manage"
  | "fees.view"
  | "fees.manage"
  | "masters.edit"
  | "announcements.send"
  | "settings.edit"
  | "roles.edit"
  | "reports.view";

export type PaymentMethod = "UPI" | "Card" | "Net Banking" | "Counter";

export interface FeePayment {
  feeId: string;
  enrollmentNo: string;
  amount: number;
  method: PaymentMethod;
  transactionId: string;
  receiptNo: string;
  paidOn: string; // ISO
}

/** A row parsed from the bulk-import CSV (a new admission). */
export interface ImportedStudentRow {
  enrollmentNo: string;
  name: string;
  dob: string;
  branch: string;
  section: string;
  category: string;
  email: string;
  phone: string;
}

/* ============================================================================
 * Admission Portal — a separate, applicant-facing sub-app that remakes the
 * institute's post-counselling online-admission software. Two actors:
 * the Applicant (verified against a mock DTE eligible-list) and the
 * Verification Incharge. Field names mirror the real DB to stay faithful.
 * ========================================================================== */

export type AdmissionProgram = "BTech";

/**
 * A row from the DTE (MPDTE) eligible-allotment list. This is both the login
 * source (matched on rollno + rank + contact) and the read-only "Section A"
 * of the admission form. `eligCat`/`allotCat` are DTE seat-pool codes
 * (e.g. URXOP, OBCXF, AIUR, EWS) kept as free text.
 */
export interface EligibleCandidate {
  program: AdmissionProgram;
  branch: BranchCode;
  rank: number;
  marks: number;
  rollno: string;
  name: string;
  father: string;
  mother: string;
  eligCat: string;
  allotCat: string;
  domicile: "Y" | "N";
  gender: "M" | "F";
  ews: "Y" | "N";
  contNo: string;
  status: "Not Reported" | "Allotment Letter Printed" | "Upgrade";
  allotDate: string;
  allotRound: string;
}

/** A verification incharge (admin actor of the admission portal). */
export interface AdmissionIncharge {
  id: string;
  name: string;
  email: string;
  photoColor: string;
}

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "Not Known";
export type AdmissionCategory = "General" | "OBC" | "SC" | "ST" | "EWS";
export type AdmissionSubCategory =
  | "Handicapped"
  | "J K Resident"
  | "J K Migrant"
  | "PMSSS"
  | "EWS"
  | "TFW"
  | "DAVV-EQ"
  | "None";
export type Religion = "Hindu" | "Muslim" | "Christian" | "Sikh" | "Jain" | "Buddhist" | "Other";
export type LastExam = "HSSC (12th)" | "Diploma" | "Other";
export type ExamBoard =
  | "CBSE"
  | "ICSE"
  | "MP Board"
  | "Any Other School Education Board"
  | "DAVV"
  | "RGPV"
  | "Other";

/** Mocked upload — we keep metadata (+ a transient in-memory preview), never files. */
export interface UploadMeta {
  name: string;
  sizeKB: number;
  type: string;
  dataUrl?: string;
}

/** One offline fee transaction the applicant records (UTR + proof). */
export interface PaymentRow {
  id: string;
  txnNo: string;
  amount: number;
  payDate: string;
  bankMode: string;
  remarks?: string;
  proof?: UploadMeta;
}

export interface AdmissionAddress {
  houseNo: string;
  street: string;
  state: string;
  district: string;
  city: string;
  pin: string;
}

export type ApplicationStatus = "pending" | "approved" | "rejected" | "cancelled";

/** A submitted admission form (Sections B–F + the pre-paid fee details). */
export interface AdmissionApplication {
  /** Generated on first submit: 2627XXXX. Stable across resubmissions. */
  applicationNo: string;
  /** FK → EligibleCandidate; Section A is derived from this, never edited. */
  rollno: string;

  // B — Identity & Contact
  aadharNo: string;
  apaarId?: string;
  email: string;
  bloodGroup: BloodGroup;
  photo?: UploadMeta;

  // C — Category & Religion
  category: AdmissionCategory;
  subCategory: AdmissionSubCategory;
  religion: Religion;
  minority: "Yes" | "No";

  // D — Academic
  hscPercent: number;
  hscPassingYear: number;
  hscUniversity: ExamBoard;
  hscUniversityOther?: string;
  lastExam: LastExam;
  lastExamOther?: string;
  passingYear: number;
  university: ExamBoard;
  universityOther?: string;
  dob: string;

  // E — Family & Guardian
  fatherOcc?: string;
  motherOcc?: string;
  placeOfWork?: string;
  parentMobile: string;

  // F — Address
  perm: AdmissionAddress;
  local: AdmissionAddress;
  guardianMobile: string;
  guardianAddress: string;

  // Payment (fixed, pre-paid fee)
  payments: PaymentRow[];

  // Workflow
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  seatNo?: string;
}

/** The applicant-editable slice the form owns (Section A + workflow excluded). */
export type AdmissionFormData = Omit<
  AdmissionApplication,
  | "applicationNo"
  | "rollno"
  | "status"
  | "submittedAt"
  | "updatedAt"
  | "decidedAt"
  | "decidedBy"
  | "rejectionReason"
  | "cancellationReason"
  | "seatNo"
>;
