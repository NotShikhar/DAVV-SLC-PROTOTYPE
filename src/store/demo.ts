"use client";

import { create } from "zustand";
import type {
  AppNotification,
  Branch,
  CalendarEvent,
  CertificateRequest,
  ExamRegistration,
  FeePayment,
  ImportedStudentRow,
} from "@/types";
import { NOTIFICATIONS, SEED_CERTIFICATE_REQUESTS } from "@/data";

/**
 * "Live" prototype state layered on top of the seeded mock data so actions feel
 * real within a session: reading notifications, requesting certificates,
 * submitting the exam form, and faculty entering internal marks. In-memory only
 * (resets on reload) — the seed data stays authoritative.
 */

export interface InternalOverride {
  mst2: number | null;
  quiz: number | null;
}

/** Key for an internal-marks override: one course × one student. */
export function overrideKey(courseCode: string, enrollmentNo: string): string {
  return `${courseCode}:${enrollmentNo}`;
}

interface DemoState {
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  certificates: CertificateRequest[];
  addCertificate: (req: Pick<CertificateRequest, "type" | "copies" | "purpose" | "delivery">) => void;

  examRegistrations: Record<string, ExamRegistration>;
  submitExamForm: (
    enrollmentNo: string,
    reg: Omit<ExamRegistration, "submitted" | "hallTicketNo">,
  ) => string;

  internalOverrides: Record<string, InternalOverride>;
  saveInternalMarks: (courseCode: string, enrollmentNo: string, override: InternalOverride) => void;

  /** Fees paid in-app this session (feeId → payment). */
  paidFees: Record<string, FeePayment>;
  recordPayments: (payments: FeePayment[]) => void;

  /** Students added via bulk import (new admissions). */
  importedStudents: ImportedStudentRow[];
  importStudents: (rows: ImportedStudentRow[]) => void;

  /** Users an admin has deactivated (ids). */
  deactivatedUserIds: string[];
  toggleUserActive: (id: string) => void;

  /** Push an announcement into the notification feed. */
  broadcast: (input: { title: string; message: string; kind: AppNotification["kind"]; href?: string }) => void;

  /** Master data added at runtime (session-only). */
  extraEvents: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  extraBranches: Branch[];
  addBranch: (branch: Branch) => void;
}

export const useDemo = create<DemoState>((set) => ({
  notifications: NOTIFICATIONS.map((n) => ({ ...n })),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllNotificationsRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  certificates: SEED_CERTIFICATE_REQUESTS.map((c) => ({ ...c })),
  addCertificate: (req) =>
    set((s) => ({
      certificates: [
        {
          ...req,
          id: `cert-${Date.now()}`,
          requestedOn: new Date().toISOString(),
          status: "Submitted",
        },
        ...s.certificates,
      ],
    })),

  examRegistrations: {},
  submitExamForm: (enrollmentNo, reg) => {
    const hallTicketNo = `HT/2026/${enrollmentNo.slice(-4)}`;
    set((s) => ({
      examRegistrations: {
        ...s.examRegistrations,
        [enrollmentNo]: { ...reg, submitted: true, hallTicketNo },
      },
    }));
    return hallTicketNo;
  },

  internalOverrides: {},
  saveInternalMarks: (courseCode, enrollmentNo, override) =>
    set((s) => ({
      internalOverrides: {
        ...s.internalOverrides,
        [overrideKey(courseCode, enrollmentNo)]: override,
      },
    })),

  paidFees: {},
  recordPayments: (payments) =>
    set((s) => {
      const next = { ...s.paidFees };
      payments.forEach((p) => {
        next[p.feeId] = p;
      });
      return { paidFees: next };
    }),

  importedStudents: [],
  importStudents: (rows) => set((s) => ({ importedStudents: [...rows, ...s.importedStudents] })),

  deactivatedUserIds: [],
  toggleUserActive: (id) =>
    set((s) => ({
      deactivatedUserIds: s.deactivatedUserIds.includes(id)
        ? s.deactivatedUserIds.filter((x) => x !== id)
        : [...s.deactivatedUserIds, id],
    })),

  broadcast: (input) =>
    set((s) => ({
      notifications: [
        { id: `bc-${Date.now()}`, read: false, date: new Date().toISOString(), ...input },
        ...s.notifications,
      ],
    })),

  extraEvents: [],
  addEvent: (event) => set((s) => ({ extraEvents: [event, ...s.extraEvents] })),
  extraBranches: [],
  addBranch: (branch) => set((s) => ({ extraBranches: [...s.extraBranches, branch] })),
}));
