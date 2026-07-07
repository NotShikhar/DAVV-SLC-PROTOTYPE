import type { CalendarEvent } from "@/types";

/** Semester-V academic calendar (mock), Jul–Dec 2026. */
export const CALENDAR: CalendarEvent[] = [
  { id: "e1", title: "Semester IV results declared", date: "2026-06-28", type: "result" },
  { id: "e2", title: "Semester V classes begin", date: "2026-07-07", type: "class" },
  { id: "e3", title: "Subject registration closes", date: "2026-07-25", type: "registration" },
  { id: "e4", title: "Mid-Semester Test-I", date: "2026-09-14", type: "exam", detail: "14–19 Sep 2026" },
  { id: "e5", title: "Examination fee due", date: "2026-10-10", type: "fee" },
  { id: "e6", title: "Exam form window opens", date: "2026-10-15", type: "form" },
  { id: "e7", title: "Exam form window closes", date: "2026-10-30", type: "form" },
  { id: "e8", title: "Mid-Semester Test-II", date: "2026-11-16", type: "exam", detail: "16–21 Nov 2026" },
  { id: "e9", title: "End-Semester examinations begin", date: "2026-12-08", type: "exam" },
  { id: "e10", title: "Winter break", date: "2026-12-24", type: "holiday" },
];

/** Upcoming events on/after a given ISO date, soonest first. */
export function upcomingEvents(fromISO: string, limit = 5): CalendarEvent[] {
  const from = new Date(fromISO).getTime();
  return CALENDAR.filter((e) => new Date(e.date).getTime() >= from)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
}
