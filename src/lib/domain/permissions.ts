import type { AdminRole, Permission } from "@/types";

/**
 * ============================================================================
 * Admin roles & permissions (RBAC)
 * ----------------------------------------------------------------------------
 * The admin portal has sub-roles; each grants a set of permissions. A Super
 * Admin can retune the matrix at runtime (stored in the settings store). These
 * are the DEFAULTS.
 * ============================================================================
 */

export const ADMIN_ROLES: { key: AdminRole; label: string; description: string }[] = [
  { key: "super", label: "Super Admin", description: "Full access, including roles & settings." },
  { key: "registrar", label: "Registrar", description: "Students, admissions, records & masters." },
  { key: "exam", label: "Examination Cell", description: "Exams, results & announcements." },
  { key: "accounts", label: "Accounts", description: "Fees, collections & receipts." },
  { key: "dept", label: "Department Admin", description: "Branch-level view & announcements." },
];

export const PERMISSIONS: { key: Permission; label: string; group: string }[] = [
  { key: "students.view", label: "View students", group: "Students" },
  { key: "students.manage", label: "Manage students", group: "Students" },
  { key: "students.import", label: "Bulk import students", group: "Students" },
  { key: "faculty.manage", label: "Manage faculty", group: "People" },
  { key: "fees.view", label: "View fees & collections", group: "Fees" },
  { key: "fees.manage", label: "Verify / manage payments", group: "Fees" },
  { key: "masters.edit", label: "Edit master data", group: "Configuration" },
  { key: "announcements.send", label: "Send announcements", group: "Communication" },
  { key: "settings.edit", label: "Edit portal settings", group: "Configuration" },
  { key: "roles.edit", label: "Edit roles & permissions", group: "Configuration" },
  { key: "reports.view", label: "View reports", group: "Insights" },
];

const ALL: Permission[] = PERMISSIONS.map((p) => p.key);

export const DEFAULT_MATRIX: Record<AdminRole, Permission[]> = {
  super: ALL,
  registrar: [
    "students.view",
    "students.manage",
    "students.import",
    "faculty.manage",
    "masters.edit",
    "announcements.send",
    "reports.view",
  ],
  exam: ["students.view", "masters.edit", "announcements.send", "reports.view"],
  accounts: ["students.view", "fees.view", "fees.manage", "reports.view"],
  dept: ["students.view", "announcements.send", "reports.view"],
};

export function permissionLabel(key: Permission): string {
  return PERMISSIONS.find((p) => p.key === key)?.label ?? key;
}

export function adminRoleLabel(key: AdminRole): string {
  return ADMIN_ROLES.find((r) => r.key === key)?.label ?? key;
}
