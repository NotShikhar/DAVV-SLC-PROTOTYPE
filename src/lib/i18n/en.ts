/**
 * English dictionary. All user-facing chrome copy lives here as dotted keys so
 * a Hindi dictionary (hi.ts) can be added later without touching components.
 */
export const en = {
  app: {
    name: "Student Lifecycle Portal",
    short: "SLC",
    university: "Devi Ahilya Vishwavidyalaya, Indore",
    institute: "Institute of Engineering & Technology",
  },
  roles: {
    student: "Student",
    faculty: "Faculty",
    admin: "Administration",
  },
  nav: {
    dashboard: "Dashboard",
    admission: "Admission",
    registration: "Registration",
    courses: "Courses",
    assessment: "Internal Assessment",
    examinations: "Examinations",
    results: "Results",
    degreeAudit: "Degree Audit",
    services: "Student Services",
    fees: "Fees",
    notifications: "Notifications",
    profile: "Profile",
    marksEntry: "Marks Entry",
    attendanceEntry: "Attendance",
    classList: "Class List",
    users: "User Management",
    masters: "Masters",
    students: "Students",
    feeCollection: "Fee Collection",
    announcements: "Announcements",
    reports: "Reports",
    roles: "Roles & Permissions",
    settings: "Settings",
  },
  common: {
    search: "Search",
    logout: "Sign out",
    viewAll: "View all",
    apply: "Apply",
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    download: "Download",
    back: "Back",
    openPortal: "Open official portal",
    dueBy: "Due by",
  },
} as const;

export type Dictionary = typeof en;
