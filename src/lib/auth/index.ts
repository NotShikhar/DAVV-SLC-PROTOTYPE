"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AdminUser, Faculty, Permission, Role, Student } from "@/types";
import { getAdmin, getFaculty, getStudent } from "@/data";
import { useSession } from "@/store/session";
import { useSettings } from "@/store/settings";
import { useMounted } from "@/lib/hooks/useMounted";

/** Raw session (role + user id). */
export function useAuth() {
  const role = useSession((s) => s.role);
  const userId = useSession((s) => s.userId);
  return { role, userId, isAuthed: Boolean(role && userId) };
}

export function useCurrentStudent(): Student | null {
  const { role, userId } = useAuth();
  return role === "student" && userId ? (getStudent(userId) ?? null) : null;
}

export function useCurrentFaculty(): Faculty | null {
  const { role, userId } = useAuth();
  return role === "faculty" && userId ? (getFaculty(userId) ?? null) : null;
}

export function useCurrentAdmin(): AdminUser | null {
  const { role, userId } = useAuth();
  return role === "admin" && userId ? (getAdmin(userId) ?? null) : null;
}

/** Effective permissions for the signed-in admin (from the editable matrix). */
export function useAdminPermissions(): Permission[] {
  const admin = useCurrentAdmin();
  const matrix = useSettings((s) => s.matrix);
  return admin ? (matrix[admin.adminRole] ?? []) : [];
}

export function useHasPermission(permission: Permission): boolean {
  return useAdminPermissions().includes(permission);
}

/**
 * Client-side route guard. Redirects to /login if not signed in, or to the
 * user's own home if they hold a different role. Returns `ready` once the
 * persisted session has hydrated and the role matches.
 */
export function useRequireRole(role: Role): { ready: boolean } {
  const router = useRouter();
  const mounted = useMounted();
  const { role: current, isAuthed } = useAuth();

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthed) {
      router.replace("/login");
    } else if (current !== role) {
      router.replace("/login");
    }
  }, [mounted, isAuthed, current, role, router]);

  return { ready: mounted && isAuthed && current === role };
}
