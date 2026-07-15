"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { Role } from "@/types";
import { getAdmin, getFaculty, getStudent } from "@/data";
import { useAuth, useRequireRole } from "@/lib/auth";
import { Crest } from "@/components/shared/Logo";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Footer } from "./Footer";
import { Toaster } from "./Toaster";

interface UserChip {
  name: string;
  meta: string;
  color: string;
}

function resolveUser(role: Role, userId: string): UserChip {
  if (role === "student") {
    const s = getStudent(userId);
    if (s) return { name: s.name, meta: `Enroll. ${s.enrollmentNo}`, color: s.photoColor };
  }
  if (role === "faculty") {
    const f = getFaculty(userId);
    if (f) return { name: f.name, meta: f.designation, color: f.photoColor };
  }
  if (role === "admin") {
    const a = getAdmin(userId);
    if (a) return { name: a.name, meta: "Administration", color: a.photoColor };
  }
  return { name: "User", meta: "", color: "#1a3a5c" };
}

function FullScreenLoader() {
  return (
    <div className="bg-cream grid min-h-screen place-items-center">
      <Crest className="size-12 animate-pulse" />
    </div>
  );
}

/**
 * Role-guarded application shell: floating navy sidebar, sticky top bar, centred
 * content column and footer. Redirects to /login if the session role does not
 * match the route group.
 */
export function RoleShell({ role, children }: { role: Role; children: ReactNode }) {
  const { ready } = useRequireRole(role);
  const { userId } = useAuth();
  const pathname = usePathname();

  if (!ready || !userId) return <FullScreenLoader />;

  const user = resolveUser(role, userId);

  return (
    <div className="min-h-full">
      <Sidebar role={role} />
      <div className="flex min-h-full flex-col lg:pl-[108px]">
        <Topbar role={role} name={user.name} meta={user.meta} color={user.color} />
        <main
          key={pathname}
          className="animate-fade-up mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 sm:px-6"
        >
          {children}
        </main>
        <Footer />
      </div>
      <Toaster />
    </div>
  );
}
