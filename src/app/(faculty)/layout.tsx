import type { ReactNode } from "react";
import { RoleShell } from "@/components/layout/RoleShell";

export default function FacultyLayout({ children }: { children: ReactNode }) {
  return <RoleShell role="faculty">{children}</RoleShell>;
}
