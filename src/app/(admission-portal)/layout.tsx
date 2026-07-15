import type { ReactNode } from "react";
import { AdmissionShell } from "@/components/admissions/AdmissionShell";

/** Chrome for the standalone admission portal (applicant + incharge sub-app). */
export default function AdmissionPortalLayout({ children }: { children: ReactNode }) {
  return <AdmissionShell>{children}</AdmissionShell>;
}
