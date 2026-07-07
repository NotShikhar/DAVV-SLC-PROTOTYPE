"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/lib/i18n";

export type ToastTone = "success" | "warning" | "danger" | "info";
export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface UiState {
  locale: Locale;
  setLocale: (locale: Locale) => void;

  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;

  toasts: Toast[];
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

let toastSeq = 0;

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),

      sidebarOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebar: (open) => set({ sidebarOpen: open }),

      toasts: [],
      pushToast: (toast) =>
        set((s) => ({ toasts: [...s.toasts, { ...toast, id: `t-${++toastSeq}-${Date.now()}` }] })),
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: "davv-slc-ui",
      // Persist only durable preferences; toasts are ephemeral.
      partialize: (s) => ({ locale: s.locale, sidebarOpen: s.sidebarOpen }),
    },
  ),
);
