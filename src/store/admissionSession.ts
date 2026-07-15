"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Admission-portal session — deliberately separate from the main app's
 * `useSession` so the applicant/incharge sub-app never widens the `Role` union
 * or shares identity with the enrolled-student portal. Two actors:
 *  • applicant — identified by the matched DTE roll number (no password)
 *  • incharge  — identified by a selected AdmissionIncharge id
 */
export type AdmissionActor = "applicant" | "incharge";

interface AdmissionSessionState {
  actor: AdmissionActor | null;
  applicantRoll: string | null;
  inchargeId: string | null;
  loginApplicant: (rollno: string) => void;
  loginIncharge: (id: string) => void;
  logout: () => void;
}

export const useAdmissionSession = create<AdmissionSessionState>()(
  persist(
    (set) => ({
      actor: null,
      applicantRoll: null,
      inchargeId: null,
      loginApplicant: (rollno) => set({ actor: "applicant", applicantRoll: rollno, inchargeId: null }),
      loginIncharge: (id) => set({ actor: "incharge", inchargeId: id, applicantRoll: null }),
      logout: () => set({ actor: null, applicantRoll: null, inchargeId: null }),
    }),
    { name: "davv-admission-session" },
  ),
);
