import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  Database,
  FileCheck,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Settings,
  ShieldCheck,
  Stamp,
  User,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Permission, Role } from "@/types";
import type { StudentFeature } from "@/store/settings";

export interface NavItem {
  key: string;
  href: string;
  /** i18n key resolved by the Sidebar via useTranslation. */
  labelKey: string;
  icon: LucideIcon;
  /** Admin items are hidden unless the signed-in admin holds this permission. */
  permission?: Permission;
  /** Student items are hidden when this feature is toggled off in settings. */
  feature?: StudentFeature;
}

const STUDENT_NAV: NavItem[] = [
  { key: "dashboard", href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { key: "admission", href: "/admission", labelKey: "nav.admission", icon: FileCheck },
  { key: "registration", href: "/registration", labelKey: "nav.registration", icon: ClipboardList },
  { key: "courses", href: "/courses", labelKey: "nav.courses", icon: BookOpen },
  { key: "assessment", href: "/assessment", labelKey: "nav.assessment", icon: ClipboardCheck },
  { key: "examinations", href: "/examinations", labelKey: "nav.examinations", icon: GraduationCap },
  { key: "results", href: "/results", labelKey: "nav.results", icon: Award },
  { key: "degree-audit", href: "/degree-audit", labelKey: "nav.degreeAudit", icon: ListChecks },
  { key: "services", href: "/services", labelKey: "nav.services", icon: Stamp, feature: "services" },
  { key: "fees", href: "/fees", labelKey: "nav.fees", icon: Wallet, feature: "fees" },
  { key: "notifications", href: "/notifications", labelKey: "nav.notifications", icon: Bell, feature: "notifications" },
  { key: "profile", href: "/profile", labelKey: "nav.profile", icon: User },
];

const FACULTY_NAV: NavItem[] = [
  { key: "dashboard", href: "/faculty/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { key: "marks-entry", href: "/faculty/marks-entry", labelKey: "nav.marksEntry", icon: ClipboardCheck },
  { key: "attendance", href: "/faculty/attendance", labelKey: "nav.attendanceEntry", icon: CalendarCheck },
  { key: "class-list", href: "/faculty/class-list", labelKey: "nav.classList", icon: Users },
];

const ADMIN_NAV: NavItem[] = [
  { key: "dashboard", href: "/admin/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { key: "students", href: "/admin/students", labelKey: "nav.students", icon: Users, permission: "students.view" },
  { key: "fees", href: "/admin/fees", labelKey: "nav.feeCollection", icon: Wallet, permission: "fees.view" },
  { key: "announcements", href: "/admin/announcements", labelKey: "nav.announcements", icon: Megaphone, permission: "announcements.send" },
  { key: "users", href: "/admin/users", labelKey: "nav.users", icon: UserCog, permission: "students.manage" },
  { key: "masters", href: "/admin/masters", labelKey: "nav.masters", icon: Database, permission: "masters.edit" },
  { key: "reports", href: "/admin/reports", labelKey: "nav.reports", icon: BarChart3, permission: "reports.view" },
  { key: "roles", href: "/admin/roles", labelKey: "nav.roles", icon: ShieldCheck, permission: "roles.edit" },
  { key: "settings", href: "/admin/settings", labelKey: "nav.settings", icon: Settings, permission: "settings.edit" },
];

export function navForRole(role: Role): NavItem[] {
  switch (role) {
    case "student":
      return STUDENT_NAV;
    case "faculty":
      return FACULTY_NAV;
    case "admin":
      return ADMIN_NAV;
  }
}
