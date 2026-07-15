"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AdmissionIncharge, EligibleCandidate } from "@/types";
import { getEligibleCandidate, getIncharge } from "@/data";
import { useAdmissionSession, type AdmissionActor } from "@/store/admissionSession";
import { useMounted } from "@/lib/hooks/useMounted";
import { ADMISSION_ROUTES } from "@/config/admissions";

/** Raw admission session (actor + identity). */
export function useAdmissionAuth() {
  const actor = useAdmissionSession((s) => s.actor);
  const applicantRoll = useAdmissionSession((s) => s.applicantRoll);
  const inchargeId = useAdmissionSession((s) => s.inchargeId);
  return { actor, applicantRoll, inchargeId, isAuthed: Boolean(actor) };
}

/** The matched DTE candidate for the signed-in applicant (null otherwise). */
export function useCurrentApplicant(): EligibleCandidate | null {
  const { actor, applicantRoll } = useAdmissionAuth();
  return actor === "applicant" && applicantRoll
    ? (getEligibleCandidate(applicantRoll) ?? null)
    : null;
}

/** The signed-in verification incharge (null otherwise). */
export function useCurrentIncharge(): AdmissionIncharge | null {
  const { actor, inchargeId } = useAdmissionAuth();
  return actor === "incharge" && inchargeId ? (getIncharge(inchargeId) ?? null) : null;
}

/**
 * Client-side guard for the admission portal. Redirects to the admission login
 * if the session actor does not match. Returns `ready` once hydrated and matched.
 */
export function useRequireActor(actor: AdmissionActor): { ready: boolean } {
  const router = useRouter();
  const mounted = useMounted();
  const { actor: current, isAuthed } = useAdmissionAuth();

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthed || current !== actor) router.replace(ADMISSION_ROUTES.login);
  }, [mounted, isAuthed, current, actor, router]);

  return { ready: mounted && isAuthed && current === actor };
}
