import type { AdminUser } from "@/types";

/** Administrative users (mock) — one per admin sub-role. */
export const ADMINS: AdminUser[] = [
  { id: "IET-ADM-001", name: "Dr. P. Bansal (Director)", role: "admin", adminRole: "super", email: "director@ietdavv.edu.in", photoColor: "#0d1f34", active: true },
  { id: "IET-ADM-002", name: "Registrar's Office", role: "admin", adminRole: "registrar", email: "registrar@ietdavv.edu.in", photoColor: "#1a3a5c", active: true },
  { id: "IET-ADM-003", name: "Examination Cell", role: "admin", adminRole: "exam", email: "exam@ietdavv.edu.in", photoColor: "#6d28d9", active: true },
  { id: "IET-ADM-004", name: "Accounts Section", role: "admin", adminRole: "accounts", email: "accounts@ietdavv.edu.in", photoColor: "#0f766e", active: true },
  { id: "IET-ADM-005", name: "CSE Department Admin", role: "admin", adminRole: "dept", email: "cse.admin@ietdavv.edu.in", photoColor: "#b45309", active: true },
];

export const PRIMARY_ADMIN_ID = ADMINS[0].id;

export function getAdmin(id: string): AdminUser | undefined {
  return ADMINS.find((a) => a.id === id);
}

export function listAdmins(): AdminUser[] {
  return ADMINS;
}
