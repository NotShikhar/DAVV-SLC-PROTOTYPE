"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminRole, Permission } from "@/types";
import { DEFAULT_MATRIX } from "@/lib/domain/permissions";
import { ATTENDANCE_THRESHOLD, FEE_STRUCTURE, INSTITUTE } from "@/lib/domain/constants";

export type AccentKey = "gold" | "teal" | "maroon" | "azure";

export const ACCENTS: Record<AccentKey, { label: string; hex: string; hex600: string }> = {
  gold: { label: "Heritage Gold", hex: "#c9974b", hex600: "#a97f3f" },
  teal: { label: "Teal", hex: "#2f7d6e", hex600: "#276657" },
  maroon: { label: "Maroon", hex: "#9c4a52", hex600: "#823a42" },
  azure: { label: "Azure", hex: "#3f6ea8", hex600: "#345a8c" },
};

export type StudentFeature = "fees" | "services" | "notifications";

/**
 * Portal-wide, admin-editable configuration. Persisted so a Super Admin's
 * customization (accent, feature toggles, permission matrix, fee amounts…)
 * survives reloads.
 */
interface SettingsState {
  instituteName: string;
  currentSemester: number;
  session: string;
  attendanceThreshold: number;
  fee: { tuition: number; exam: number; hostel: number };
  accent: AccentKey;
  features: Record<StudentFeature, boolean>;
  matrix: Record<AdminRole, Permission[]>;

  update: (
    partial: Partial<
      Pick<SettingsState, "instituteName" | "currentSemester" | "session" | "attendanceThreshold" | "accent">
    >,
  ) => void;
  setFee: (fee: Partial<SettingsState["fee"]>) => void;
  toggleFeature: (feature: StudentFeature) => void;
  togglePermission: (role: AdminRole, permission: Permission) => void;
  resetMatrix: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      instituteName: INSTITUTE.name,
      currentSemester: 5,
      session: "Jul–Dec 2026",
      attendanceThreshold: ATTENDANCE_THRESHOLD,
      fee: {
        tuition: FEE_STRUCTURE.tuitionPerSemester,
        exam: FEE_STRUCTURE.examPerSemester,
        hostel: FEE_STRUCTURE.hostelPerYear,
      },
      accent: "gold",
      features: { fees: true, services: true, notifications: true },
      matrix: DEFAULT_MATRIX,

      update: (partial) => set(partial),
      setFee: (fee) => set((s) => ({ fee: { ...s.fee, ...fee } })),
      toggleFeature: (feature) =>
        set((s) => ({ features: { ...s.features, [feature]: !s.features[feature] } })),
      togglePermission: (role, permission) =>
        set((s) => {
          const current = s.matrix[role] ?? [];
          const next = current.includes(permission)
            ? current.filter((p) => p !== permission)
            : [...current, permission];
          return { matrix: { ...s.matrix, [role]: next } };
        }),
      resetMatrix: () => set({ matrix: DEFAULT_MATRIX }),
    }),
    { name: "davv-slc-settings" },
  ),
);
