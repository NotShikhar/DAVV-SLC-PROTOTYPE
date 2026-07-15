"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdmissionApplication, AdmissionFormData } from "@/types";
import { SEED_ADMISSION_APPLICATIONS, getEligibleCandidate } from "@/data";
import { makeSeatNo, nextApplicationNo } from "@/lib/domain";

/**
 * "Live" admission applications layered on the seed data. Persisted so the
 * applicant narrative (submit → confirmation "email" → return later → see the
 * decision → resubmit after a rejection) survives reloads. Confirmation emails
 * are *simulated* — recorded here and surfaced as an in-portal outbox + toast;
 * nothing leaves the browser.
 */
export interface SimulatedEmail {
  id: string;
  to: string;
  kind: "submitted" | "approved" | "rejected" | "cancelled";
  subject: string;
  body: string;
  at: string;
}

interface AdmissionsState {
  applications: AdmissionApplication[];
  sentEmails: SimulatedEmail[];
  /** Submit a new form, or resubmit a corrected one after rejection. Returns the app no. */
  submitApplication: (rollno: string, form: AdmissionFormData) => string;
  approveApplication: (applicationNo: string, inchargeId: string) => void;
  rejectApplication: (applicationNo: string, inchargeId: string, reason: string) => void;
  cancelApplication: (applicationNo: string, inchargeId: string, reason: string) => void;
  getByRoll: (rollno: string) => AdmissionApplication | undefined;
  getByNo: (applicationNo: string) => AdmissionApplication | undefined;
}

function email(
  kind: SimulatedEmail["kind"],
  to: string,
  applicationNo: string,
  extra?: { reason?: string; seatNo?: string },
): SimulatedEmail {
  const map: Record<SimulatedEmail["kind"], { subject: string; body: string }> = {
    submitted: {
      subject: `Admission form received — ${applicationNo}`,
      body: `Your admission form (Application No ${applicationNo}) has been submitted and is under review. Please keep this number for reference.`,
    },
    approved: {
      subject: `Admission Approved — ${applicationNo}`,
      body: `Congratulations! Your admission (Application No ${applicationNo}) has been approved and your seat${extra?.seatNo ? ` (${extra.seatNo})` : ""} is confirmed. You may download your admission form and fee receipt.`,
    },
    rejected: {
      subject: `Action needed on your admission form — ${applicationNo}`,
      body: `Your admission form (Application No ${applicationNo}) needs correction. Reason: ${extra?.reason ?? "—"}. Please log in, edit the highlighted details and resubmit.`,
    },
    cancelled: {
      subject: `Admission cancelled — ${applicationNo}`,
      body: `Your admission (Application No ${applicationNo}) has been cancelled. Reason: ${extra?.reason ?? "—"}.`,
    },
  };
  return {
    id: `mail-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    to,
    kind,
    at: new Date().toISOString(),
    ...map[kind],
  };
}

/** Drop transient base64 previews before writing to localStorage (avoids quota bloat). */
function stripPreviews(app: AdmissionApplication): AdmissionApplication {
  return {
    ...app,
    photo: app.photo ? { ...app.photo, dataUrl: undefined } : app.photo,
    payments: app.payments.map((p) =>
      p.proof ? { ...p, proof: { ...p.proof, dataUrl: undefined } } : p,
    ),
  };
}

export const useAdmissions = create<AdmissionsState>()(
  persist(
    (set, get) => ({
      applications: SEED_ADMISSION_APPLICATIONS.map((a) => ({ ...a })),
      sentEmails: [],

      submitApplication: (rollno, form) => {
        const now = new Date().toISOString();
        const existing = get().applications.find((a) => a.rollno === rollno);
        const applicationNo = existing ? existing.applicationNo : nextApplicationNo(get().applications);
        const merged: AdmissionApplication = {
          ...form,
          applicationNo,
          rollno,
          status: "pending",
          submittedAt: existing ? existing.submittedAt : now,
          updatedAt: now,
          // clear any prior decision on resubmit
          decidedAt: undefined,
          decidedBy: undefined,
          rejectionReason: undefined,
          cancellationReason: undefined,
          seatNo: undefined,
        };
        set((s) => ({
          applications: existing
            ? s.applications.map((a) => (a.rollno === rollno ? merged : a))
            : [merged, ...s.applications],
          sentEmails: [email("submitted", form.email, applicationNo), ...s.sentEmails],
        }));
        return applicationNo;
      },

      approveApplication: (applicationNo, inchargeId) =>
        set((s) => {
          const target = s.applications.find((a) => a.applicationNo === applicationNo);
          if (!target) return s;
          const branch = getEligibleCandidate(target.rollno)?.branch;
          const filledBefore = branch
            ? s.applications.filter(
                (a) => a.status === "approved" && getEligibleCandidate(a.rollno)?.branch === branch,
              ).length
            : 0;
          const seatNo = branch ? makeSeatNo(branch, filledBefore + 1) : undefined;
          const now = new Date().toISOString();
          return {
            applications: s.applications.map((a) =>
              a.applicationNo === applicationNo
                ? {
                    ...a,
                    status: "approved",
                    decidedAt: now,
                    decidedBy: inchargeId,
                    rejectionReason: undefined,
                    seatNo,
                    updatedAt: now,
                  }
                : a,
            ),
            sentEmails: [email("approved", target.email, applicationNo, { seatNo }), ...s.sentEmails],
          };
        }),

      rejectApplication: (applicationNo, inchargeId, reason) =>
        set((s) => {
          const target = s.applications.find((a) => a.applicationNo === applicationNo);
          if (!target) return s;
          const now = new Date().toISOString();
          return {
            applications: s.applications.map((a) =>
              a.applicationNo === applicationNo
                ? { ...a, status: "rejected", decidedAt: now, decidedBy: inchargeId, rejectionReason: reason, updatedAt: now }
                : a,
            ),
            sentEmails: [email("rejected", target.email, applicationNo, { reason }), ...s.sentEmails],
          };
        }),

      cancelApplication: (applicationNo, inchargeId, reason) =>
        set((s) => {
          const target = s.applications.find((a) => a.applicationNo === applicationNo);
          if (!target) return s;
          const now = new Date().toISOString();
          return {
            applications: s.applications.map((a) =>
              a.applicationNo === applicationNo
                ? { ...a, status: "cancelled", decidedAt: now, decidedBy: inchargeId, cancellationReason: reason, seatNo: undefined, updatedAt: now }
                : a,
            ),
            sentEmails: [email("cancelled", target.email, applicationNo, { reason }), ...s.sentEmails],
          };
        }),

      getByRoll: (rollno) => get().applications.find((a) => a.rollno === rollno),
      getByNo: (applicationNo) => get().applications.find((a) => a.applicationNo === applicationNo),
    }),
    {
      name: "davv-admission-apps",
      version: 1,
      // Persist metadata but not transient base64 previews.
      partialize: (s) => ({
        applications: s.applications.map(stripPreviews),
        sentEmails: s.sentEmails,
      }),
    },
  ),
);
