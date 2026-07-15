import type { AdmissionIncharge } from "@/types";

/** Verification incharges who review admission forms (mock accounts). */
export const ADMISSION_INCHARGES: AdmissionIncharge[] = [
  { id: "IET-ADM-VER-01", name: "Admission Incharge — I", email: "admission1@ietdavv.edu.in", photoColor: "#0d1f34" },
  { id: "IET-ADM-VER-02", name: "Admission Incharge — II", email: "admission2@ietdavv.edu.in", photoColor: "#1a3a5c" },
  { id: "IET-ADM-VER-03", name: "Verification Cell (Nodal)", email: "verify.admission@ietdavv.edu.in", photoColor: "#6d28d9" },
];

export const PRIMARY_INCHARGE_ID = ADMISSION_INCHARGES[0].id;

export function getIncharge(id: string): AdmissionIncharge | undefined {
  return ADMISSION_INCHARGES.find((i) => i.id === id);
}

export function listIncharges(): AdmissionIncharge[] {
  return ADMISSION_INCHARGES;
}
