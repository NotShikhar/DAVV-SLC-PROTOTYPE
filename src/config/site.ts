import type { Role } from "@/types";

export { INSTITUTE } from "@/lib/domain/constants";

/** Landing route per role — used by login redirect and route guards. */
export const ROLE_HOME: Record<Role, string> = {
  student: "/dashboard",
  faculty: "/faculty/dashboard",
  admin: "/admin/dashboard",
};
