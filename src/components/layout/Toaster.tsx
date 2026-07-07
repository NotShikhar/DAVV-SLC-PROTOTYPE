"use client";

import { useEffect } from "react";
import { CheckCircle2, Info, TriangleAlert, X, XCircle, type LucideIcon } from "lucide-react";
import { useUi, type Toast, type ToastTone } from "@/store/ui";
import { cn } from "@/lib/utils/cn";

const ICON: Record<ToastTone, LucideIcon> = {
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: XCircle,
  info: Info,
};

const ACCENT: Record<ToastTone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-navy",
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useUi((s) => s.dismissToast);
  const Icon = ICON[toast.tone];

  useEffect(() => {
    const id = setTimeout(() => dismiss(toast.id), 3800);
    return () => clearTimeout(id);
  }, [toast.id, dismiss]);

  return (
    <div
      role="status"
      className="animate-fade-up flex w-80 items-start gap-3 rounded-card border border-line bg-surface p-3 shadow-pop"
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", ACCENT[toast.tone])} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-navy">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-xs text-muted">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss"
        className="rounded p-0.5 text-muted hover:text-navy"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useUi((s) => s.toasts);
  if (toasts.length === 0) return null;
  return (
    <div className="fixed right-4 bottom-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
