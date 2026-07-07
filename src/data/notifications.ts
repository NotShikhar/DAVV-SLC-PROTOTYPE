import type { AppNotification } from "@/types";

/**
 * Institution-wide notifications (mock), dated around the app's "today"
 * (Jul 2026, when CSE Semester V has just begun). Read/unread state is mutated
 * client-side via the demo store.
 */
export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    kind: "deadline",
    title: "Semester V registration closes 25 Jul",
    message: "Complete subject & open-elective registration on the SIS before the window closes.",
    date: "2026-07-05T09:00:00+05:30",
    read: false,
    href: "/registration",
  },
  {
    id: "n2",
    kind: "result",
    title: "Semester IV results declared",
    message: "End-semester results for Jan–Jun 2026 are now available. Revaluation window is open for 15 days.",
    date: "2026-06-28T17:30:00+05:30",
    read: false,
    href: "/results",
  },
  {
    id: "n3",
    kind: "fee",
    title: "Examination fee due by 10 Oct",
    message: "Pay the Semester V examination fee of ₹2,750 via MPOnline to receive your hall ticket.",
    date: "2026-07-03T11:00:00+05:30",
    read: false,
    href: "/fees",
  },
  {
    id: "n4",
    kind: "exam",
    title: "Mid-Semester Test-I schedule released",
    message: "MST-I for Semester V will be held during 14–19 Sep 2026. See the academic calendar for slots.",
    date: "2026-07-06T10:15:00+05:30",
    read: false,
    href: "/examinations",
  },
  {
    id: "n5",
    kind: "exam",
    title: "End-Semester exam form opens 15 Oct",
    message: "The Semester V examination form window is 15–30 Oct 2026. Attendance ≥ 75% is required.",
    date: "2026-07-01T09:00:00+05:30",
    read: true,
    href: "/examinations",
  },
  {
    id: "n6",
    kind: "info",
    title: "MP Scholarship Portal 2.0 — apply by 31 Aug",
    message: "SC/ST/OBC post-matric scholarship applications for 2026–27 are open on the state portal.",
    date: "2026-07-02T14:00:00+05:30",
    read: true,
    href: "/profile",
  },
  {
    id: "n7",
    kind: "info",
    title: "Library annual no-dues drive",
    message: "Return all issued titles before 1 Aug to keep your No-Dues status clear.",
    date: "2026-06-30T16:00:00+05:30",
    read: true,
    href: "/services",
  },
];
