"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/types";

/**
 * Mock authentication session. This is a UX-level identity only (no real
 * security) — it records who is "logged in" and their role, and persists across
 * reloads so the prototype keeps you signed in.
 */
interface SessionState {
  role: Role | null;
  /** Enrollment number (student), employee id (faculty) or admin id. */
  userId: string | null;
  login: (role: Role, userId: string) => void;
  logout: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      role: null,
      userId: null,
      login: (role, userId) => set({ role, userId }),
      logout: () => set({ role: null, userId: null }),
    }),
    { name: "davv-slc-session" },
  ),
);
