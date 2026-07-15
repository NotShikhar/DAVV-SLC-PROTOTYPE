"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useMounted } from "@/lib/hooks/useMounted";
import { useAdmissionSession } from "@/store/admissionSession";
import { useCurrentApplicant, useCurrentIncharge } from "@/lib/admissions";
import { ADMISSION_ROUTES } from "@/config/admissions";
import { Crest } from "@/components/shared/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/layout/Toaster";

/**
 * Light chrome for the admission portal — a slim branded header (with the
 * signed-in actor chip + sign-out), centred content, footer and toaster.
 * Unlike RoleShell it does NOT guard; the landing and login are public and the
 * two protected pages call `useRequireActor` themselves.
 */
export function AdmissionShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const router = useRouter();
  const mounted = useMounted();
  const actor = useAdmissionSession((s) => s.actor);
  const logout = useAdmissionSession((s) => s.logout);
  const applicant = useCurrentApplicant();
  const incharge = useCurrentIncharge();

  const who = applicant
    ? { name: applicant.name, meta: t("admissions.applicant"), color: "#1a3a5c" }
    : incharge
      ? { name: incharge.name, meta: t("admissions.incharge"), color: incharge.photoColor }
      : null;

  const signOut = () => {
    logout();
    router.push(ADMISSION_ROUTES.login);
  };

  return (
    <div className="bg-cream flex min-h-screen flex-col">
      <header className="border-hairline bg-surface/90 sticky top-0 z-30 border-b backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <a href={ADMISSION_ROUTES.landing} className="flex items-center gap-3">
            <span className="bg-navy/5 grid size-10 shrink-0 place-items-center rounded-xl p-1.5">
              <Crest className="size-8" />
            </span>
            <span className="leading-tight">
              <span className="font-heading text-navy block text-base font-bold">IET DAVV</span>
              <span className="text-muted block text-[11px]">
                {t("admissions.portalName")} · {t("admissions.session")}
              </span>
            </span>
          </a>

          {mounted && actor && who && (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-navy text-sm font-semibold">{who.name}</p>
                <p className="text-muted text-[11px]">{who.meta}</p>
              </div>
              <Avatar name={who.name} color={who.color} size="sm" ring />
              <button
                type="button"
                onClick={signOut}
                className="border-line text-muted hover:border-navy hover:text-navy inline-flex items-center gap-1.5 rounded-btn border px-2.5 py-1.5 text-xs font-medium transition-colors"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">{t("common.logout")}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="animate-fade-up mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}
