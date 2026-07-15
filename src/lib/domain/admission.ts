import type {
  AdmissionApplication,
  AdmissionCategory,
  AdmissionFormData,
  AdmissionSubCategory,
  ApplicationStatus,
  BloodGroup,
  BranchCode,
  EligibleCandidate,
  ExamBoard,
  LastExam,
  PaymentRow,
  Religion,
} from "@/types";
import { BRANCHES } from "./constants";

/**
 * ============================================================================
 * Admission Portal — domain rules (pure, framework-agnostic)
 * ----------------------------------------------------------------------------
 * Everything the post-counselling admission flow needs to *decide* lives here:
 * workflow statuses, the fixed published fee, field validators, the application
 * number scheme, and seat accounting. Screens import these; they never
 * re-implement a rule inline (golden rule).
 * ========================================================================== */

/** Shared status vocabulary (matches the Badge `Tone` union). */
type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "gold";

/* ------------------------------------------------------------------ Statuses */

export const ADMISSION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: "Pending · Under Review",
  approved: "Admission Approved",
  rejected: "Rejected · Needs Correction",
  cancelled: "Cancelled",
};

export function admissionStatusTone(status: ApplicationStatus): Tone {
  switch (status) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "danger";
    case "cancelled":
      return "neutral";
  }
}

/* ------------------------------------------------------------- Published fee */

/**
 * ⚠︎ Illustrative fixed fee for the simplified flow — the applicant pays this
 * published amount in advance (QR/UPI) and records the transaction(s) in the
 * form. Mirrors the source software's "SEM 1 / All" fee (Academic ₹45,000 +
 * Caution Money ₹4,000). A future build could vary this by category.
 */
export const ADMISSION_FEE_PARTICULARS: { label: string; amount: number; refundable?: boolean }[] =
  [
    { label: "Academic Fee", amount: 45000 },
    { label: "Caution Money", amount: 4000, refundable: true },
  ];

export const ADMISSION_FEE_TOTAL = ADMISSION_FEE_PARTICULARS.reduce((sum, f) => sum + f.amount, 0);

/* --------------------------------------------------------------- Active round */

/** The currently open counselling round shown on the landing (after TODAY_ISO). */
export const ADMISSION_ROUND = {
  roundNo: 1,
  code: "FR",
  label: "TFW and General Pool — First Round",
  opensISO: "2026-07-11",
  deadlineISO: "2026-07-20",
} as const;

/* ---------------------------------------------------------------- Option sets */

export const BLOOD_GROUPS: BloodGroup[] = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "Not Known",
];
export const ADMISSION_CATEGORIES: AdmissionCategory[] = ["General", "OBC", "SC", "ST", "EWS"];
export const ADMISSION_SUB_CATEGORIES: AdmissionSubCategory[] = [
  "None",
  "Handicapped",
  "J K Resident",
  "J K Migrant",
  "PMSSS",
  "EWS",
  "TFW",
  "DAVV-EQ",
];
export const RELIGIONS: Religion[] = [
  "Hindu",
  "Muslim",
  "Christian",
  "Sikh",
  "Jain",
  "Buddhist",
  "Other",
];
export const LAST_EXAMS: LastExam[] = ["HSSC (12th)", "Diploma", "Other"];
export const EXAM_BOARDS: ExamBoard[] = [
  "CBSE",
  "ICSE",
  "MP Board",
  "Any Other School Education Board",
  "DAVV",
  "RGPV",
  "Other",
];
/** Earliest/latest DOB accepted (a plausible band for a fresh UG intake). */
export const DOB_MIN = "2004-01-01";
export const DOB_MAX = "2011-12-31";
export const HSC_PASSING_YEARS = [2024, 2023, 2022, 2021, 2020];
export const LAST_EXAM_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

/* ----------------------------------------------------------------- Validators */

export const isAadhaar = (v: string) => /^\d{12}$/.test(v.trim());
export const isApaar = (v: string) => v.trim() === "" || /^\d{12}$/.test(v.trim());
export const isPin = (v: string) => /^\d{6}$/.test(v.trim());
export const isMobile = (v: string) => /^\d{10}$/.test(v.trim());
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
export const isPercent = (v: number) => Number.isFinite(v) && v >= 0 && v <= 100;
export const isDobInRange = (iso: string) => Boolean(iso) && iso >= DOB_MIN && iso <= DOB_MAX;

export interface FieldError {
  field: string;
  message: string;
}

const addr = (label: string, a: AdmissionFormData["perm"], errors: FieldError[]) => {
  if (!a.houseNo.trim()) errors.push({ field: `${label}.houseNo`, message: "House No is required" });
  if (!a.street.trim())
    errors.push({ field: `${label}.street`, message: "Street / Post is required" });
  if (!a.state.trim()) errors.push({ field: `${label}.state`, message: "State is required" });
  if (!a.district.trim())
    errors.push({ field: `${label}.district`, message: "District is required" });
  if (!a.city.trim()) errors.push({ field: `${label}.city`, message: "City is required" });
  if (!isPin(a.pin)) errors.push({ field: `${label}.pin`, message: "PIN must be 6 digits" });
};

/**
 * Validate the applicant's form draft. Returns an empty array when the form is
 * ready to submit; otherwise one entry per invalid field.
 */
export function validateAdmissionForm(draft: AdmissionFormData): FieldError[] {
  const e: FieldError[] = [];

  // B — Identity & Contact
  if (!isAadhaar(draft.aadharNo)) e.push({ field: "aadharNo", message: "Aadhaar must be 12 digits" });
  if (!isApaar(draft.apaarId ?? "")) e.push({ field: "apaarId", message: "APAAR/ABC ID must be 12 digits" });
  if (!isEmail(draft.email)) e.push({ field: "email", message: "Enter a valid email" });
  if (!draft.photo) e.push({ field: "photo", message: "Passport photo is required" });

  // D — Academic
  if (!isPercent(draft.hscPercent)) e.push({ field: "hscPercent", message: "Enter 10th % (0–100)" });
  if (draft.hscUniversity === "Other" && !draft.hscUniversityOther?.trim())
    e.push({ field: "hscUniversityOther", message: "Specify the board/university" });
  if (draft.lastExam === "Other" && !draft.lastExamOther?.trim())
    e.push({ field: "lastExamOther", message: "Specify the last exam" });
  if (draft.university === "Other" && !draft.universityOther?.trim())
    e.push({ field: "universityOther", message: "Specify the board/university" });
  if (!isDobInRange(draft.dob))
    e.push({ field: "dob", message: `Date of Birth must be between ${DOB_MIN} and ${DOB_MAX}` });

  // E — Family & Guardian
  if (!isMobile(draft.parentMobile))
    e.push({ field: "parentMobile", message: "Parent/Guardian mobile must be 10 digits" });

  // F — Address
  addr("perm", draft.perm, e);
  addr("local", draft.local, e);
  if (!isMobile(draft.guardianMobile))
    e.push({ field: "guardianMobile", message: "Local guardian mobile must be 10 digits" });
  if (!draft.guardianAddress.trim())
    e.push({ field: "guardianAddress", message: "Local guardian address is required" });

  // Payment — at least one complete transaction
  if (draft.payments.length === 0)
    e.push({ field: "payments", message: "Add at least one payment transaction" });
  draft.payments.forEach((p, i) => {
    if (!p.txnNo.trim()) e.push({ field: `payments.${i}.txnNo`, message: "UTR / Txn No is required" });
    if (!(p.amount > 0)) e.push({ field: `payments.${i}.amount`, message: "Enter the amount paid" });
    if (!p.payDate) e.push({ field: `payments.${i}.payDate`, message: "Payment date is required" });
    if (!p.bankMode.trim())
      e.push({ field: `payments.${i}.bankMode`, message: "Bank / mode is required" });
  });

  return e;
}

/* ---------------------------------------------------------- Application number */

/** Next application number: 2627 + 4-digit serial (e.g. 26270181). */
export function nextApplicationNo(existing: AdmissionApplication[]): string {
  const max = existing.reduce((m, a) => {
    const seq = Number(a.applicationNo.replace(/^2627/, ""));
    return Number.isFinite(seq) && seq > m ? seq : m;
  }, 0);
  return `2627${String(max + 1).padStart(4, "0")}`;
}

/* ------------------------------------------------------------------- Captcha */

/** A fresh 6-digit captcha (cosmetic only — no real security). */
export function randomCaptcha(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function captchaOk(input: string, expected: string): boolean {
  return input.trim() === expected;
}

/* -------------------------------------------------------------- Seat accounts */

export function feeEntered(payments: PaymentRow[]): number {
  return payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
}

export function countByStatus(apps: AdmissionApplication[]): Record<ApplicationStatus, number> {
  const c: Record<ApplicationStatus, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
  };
  apps.forEach((a) => (c[a.status] += 1));
  return c;
}

export interface SeatTally {
  branch: BranchCode;
  name: string;
  intake: number;
  filled: number;
  remaining: number;
}

/**
 * Per-branch seat availability. Only `approved` applications consume a seat
 * (pending forms do not) — matching the verification-gated real behaviour.
 */
export function seatTallies(
  apps: AdmissionApplication[],
  candidates: EligibleCandidate[],
): SeatTally[] {
  const branchByRoll = new Map(candidates.map((c) => [c.rollno, c.branch]));
  const filledByBranch = new Map<BranchCode, number>();
  apps
    .filter((a) => a.status === "approved")
    .forEach((a) => {
      const b = branchByRoll.get(a.rollno);
      if (b) filledByBranch.set(b, (filledByBranch.get(b) ?? 0) + 1);
    });
  return BRANCHES.map((b) => {
    const filled = filledByBranch.get(b.code) ?? 0;
    return {
      branch: b.code,
      name: b.name,
      intake: b.intake,
      filled,
      remaining: Math.max(0, b.intake - filled),
    };
  });
}

/** Allotted seat number issued on approval, e.g. IET-2026-CSE-001. */
export function makeSeatNo(branch: BranchCode, seatIndex: number): string {
  return `IET-2026-${branch}-${String(seatIndex).padStart(3, "0")}`;
}
