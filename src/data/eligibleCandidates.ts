import type { EligibleCandidate } from "@/types";

/**
 * Mock DTE (MPDTE) eligible-allotment list for the active round. In the real
 * system this is imported from the DTE CSV before the round opens; here it is
 * both the applicant login source (matched on rollno + rank + contact) and the
 * read-only "Section A" of the admission form. Roll numbers follow the real
 * 2603110xxxxx format; category codes are DTE seat-pool codes.
 *
 * Demo journeys (see the login page tags):
 *  • 260311030265 — fresh, not yet applied (the happy-path demo)
 *  • 260311030512 — has a submitted form under review (pending)
 *  • 260311030634 — was rejected with a reason (resubmission demo)
 *  • 260311030770 — approved & confirmed (seat allotted)
 */
export const ELIGIBLE_CANDIDATES: EligibleCandidate[] = [
  { program: "BTech", branch: "CSE", rank: 1240, marks: 96.2, rollno: "260311030265", name: "AARAV SHARMA", father: "RAJESH SHARMA", mother: "SUNITA SHARMA", eligCat: "URXOP", allotCat: "URXOP", domicile: "Y", gender: "M", ews: "N", contNo: "9990001001", status: "Allotment Letter Printed", allotDate: "2026-07-08", allotRound: "(TFW and General Pool First Round)" },
  { program: "BTech", branch: "IT", rank: 6791, marks: 92.4, rollno: "260311030512", name: "HARSHITA SANJAY AHER", father: "SANJAY WALMIK AHER", mother: "VARSHA SANJAY AHER", eligCat: "OBCXF", allotCat: "OBCXF", domicile: "Y", gender: "F", ews: "N", contNo: "9990002002", status: "Allotment Letter Printed", allotDate: "2026-07-08", allotRound: "(TFW and General Pool First Round)" },
  { program: "BTech", branch: "ETC", rank: 14966, marks: 88.1, rollno: "260311030634", name: "MADHUR GANGWAL", father: "ANIL GANGWAL", mother: "REKHA GANGWAL", eligCat: "SCXOP", allotCat: "SCXOP", domicile: "Y", gender: "M", ews: "N", contNo: "9990003003", status: "Not Reported", allotDate: "2026-07-08", allotRound: "(TFW and General Pool First Round)" },
  { program: "BTech", branch: "CSBS", rank: 3021, marks: 94.55, rollno: "260311030770", name: "PRIYA VERMA", father: "MAHESH VERMA", mother: "KAVITA VERMA", eligCat: "EWS", allotCat: "EWS", domicile: "Y", gender: "F", ews: "Y", contNo: "9990004004", status: "Allotment Letter Printed", allotDate: "2026-07-08", allotRound: "(TFW and General Pool First Round)" },
  { program: "BTech", branch: "CSE", rank: 2210, marks: 95.1, rollno: "260311030281", name: "ROHAN PATIDAR", father: "DINESH PATIDAR", mother: "MEENA PATIDAR", eligCat: "URXOP", allotCat: "URXOP", domicile: "Y", gender: "M", ews: "N", contNo: "9990005005", status: "Allotment Letter Printed", allotDate: "2026-07-08", allotRound: "(TFW and General Pool First Round)" },
  { program: "BTech", branch: "IT", rank: 8890, marks: 90.3, rollno: "260311030318", name: "SNEHA JAIN", father: "PANKAJ JAIN", mother: "ANITA JAIN", eligCat: "OBCXOP", allotCat: "OBCXOP", domicile: "Y", gender: "F", ews: "N", contNo: "9990006006", status: "Not Reported", allotDate: "2026-07-08", allotRound: "(TFW and General Pool First Round)" },
  { program: "BTech", branch: "ME", rank: 20144, marks: 84.6, rollno: "260311030402", name: "KARAN CHOUHAN", father: "VIJAY CHOUHAN", mother: "LATA CHOUHAN", eligCat: "STXF", allotCat: "STXF", domicile: "Y", gender: "M", ews: "N", contNo: "9990007007", status: "Not Reported", allotDate: "2026-07-08", allotRound: "(TFW and General Pool First Round)" },
  { program: "BTech", branch: "CE", rank: 24870, marks: 82.9, rollno: "260311030455", name: "ANJALI YADAV", father: "SURESH YADAV", mother: "POOJA YADAV", eligCat: "AIUR", allotCat: "AIUR", domicile: "N", gender: "F", ews: "N", contNo: "9990008008", status: "Not Reported", allotDate: "2026-07-08", allotRound: "(TFW and General Pool First Round)" },
  { program: "BTech", branch: "EI", rank: 17540, marks: 86.2, rollno: "260311030489", name: "DEVANSH RAWAT", father: "MOHAN RAWAT", mother: "GEETA RAWAT", eligCat: "OBCXOP", allotCat: "OBCXOP", domicile: "Y", gender: "M", ews: "N", contNo: "9990009009", status: "Not Reported", allotDate: "2026-07-08", allotRound: "(TFW and General Pool First Round)" },
  { program: "BTech", branch: "EEE", rank: 26010, marks: 81.4, rollno: "260311030531", name: "ISHA MALVIYA", father: "ARUN MALVIYA", mother: "SEEMA MALVIYA", eligCat: "SCXF", allotCat: "SCXF", domicile: "Y", gender: "F", ews: "N", contNo: "9990010010", status: "Not Reported", allotDate: "2026-07-08", allotRound: "(TFW and General Pool First Round)" },
  { program: "BTech", branch: "IPE", rank: 28770, marks: 80.1, rollno: "260311030588", name: "NIKHIL SOLANKI", father: "RAMESH SOLANKI", mother: "USHA SOLANKI", eligCat: "URXOP", allotCat: "URXOP", domicile: "Y", gender: "M", ews: "N", contNo: "9990011011", status: "Not Reported", allotDate: "2026-07-08", allotRound: "(TFW and General Pool First Round)" },
  { program: "BTech", branch: "CSE", rank: 1890, marks: 95.7, rollno: "260311030603", name: "TANYA GUPTA", father: "ALOK GUPTA", mother: "NEHA GUPTA", eligCat: "URHF", allotCat: "URHF", domicile: "Y", gender: "F", ews: "N", contNo: "9990012012", status: "Allotment Letter Printed", allotDate: "2026-07-08", allotRound: "(TFW and General Pool First Round)" },
];

/** The fresh, not-yet-applied candidate used as the demo default. */
export const PRIMARY_ELIGIBLE_ROLL = ELIGIBLE_CANDIDATES[0].rollno;

const BY_ROLL = new Map(ELIGIBLE_CANDIDATES.map((c) => [c.rollno, c]));

export function getEligibleCandidate(rollno: string): EligibleCandidate | undefined {
  return BY_ROLL.get(rollno);
}

export function listEligibleCandidates(): EligibleCandidate[] {
  return ELIGIBLE_CANDIDATES;
}

/**
 * Identity match for applicant login — all three of Roll No, Rank and the
 * DTE-registered contact number must match one eligible record.
 */
export function matchEligible(
  rollno: string,
  rank: string,
  contNo: string,
): EligibleCandidate | undefined {
  const c = BY_ROLL.get(rollno.trim());
  if (!c) return undefined;
  return String(c.rank) === rank.trim() && c.contNo === contNo.trim() ? c : undefined;
}
