"use client";

import Link from "next/link";
import { BookOpen, ClipboardCheck, GraduationCap, Users } from "lucide-react";
import { useCurrentFaculty } from "@/lib/auth";
import { getStudent, studentsForCourse } from "@/data";
import { overrideKey, useDemo } from "@/store/demo";
import { toRoman } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Avatar } from "@/components/ui/Avatar";
import { StatCard } from "@/components/shared/StatCard";
import { buttonClasses } from "@/components/ui/Button";

export default function FacultyDashboardPage() {
  const faculty = useCurrentFaculty();
  const overrides = useDemo((s) => s.internalOverrides);
  if (!faculty) return null;

  const firstName = faculty.name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*/, "").split(" ")[0];
  const primaryCourse = faculty.coursesTaught[0];
  const roster = studentsForCourse(primaryCourse.courseCode);

  // Students still awaiting MST-2 entry for the primary course.
  const pending = roster.filter((s) => {
    const ia = s.internals.find((i) => i.courseCode === primaryCourse.courseCode);
    const ov = overrides[overrideKey(primaryCourse.courseCode, s.enrollmentNo)];
    return ia?.mst2 == null && ov?.mst2 == null;
  }).length;

  return (
    <>
      <PageHeader
        title={`Welcome, ${firstName}`}
        description={`${faculty.designation} · Department of ${faculty.department}`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Courses" value={faculty.coursesTaught.length} icon={BookOpen} tone="info" />
        <StatCard label="Students" value={roster.length} icon={Users} tone="info" hint={primaryCourse.courseCode} />
        <StatCard label="Advisees" value={faculty.advisorOf.length} icon={GraduationCap} tone="neutral" />
        <StatCard
          label="Pending internals"
          value={pending}
          icon={ClipboardCheck}
          tone={pending ? "warning" : "success"}
          href="/faculty/marks-entry"
          hint="MST-2 to enter"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section title="My courses" icon={BookOpen} bodyClassName="p-0">
            <ul className="divide-y divide-line">
              {faculty.coursesTaught.map((c) => (
                <li key={c.courseCode} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-navy">{c.title}</p>
                    <p className="text-xs text-muted">
                      {c.courseCode} · {c.branch} · Sem {toRoman(c.semester)} · Section {c.section}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/faculty/marks-entry" className={buttonClasses("secondary", "sm")}>
                      Marks
                    </Link>
                    <Link href="/faculty/class-list" className={buttonClasses("ghost", "sm")}>
                      Class list
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <Section title="My advisees" icon={GraduationCap} bodyClassName="p-0">
          {faculty.advisorOf.length === 0 ? (
            <p className="p-5 text-sm text-muted">No advisees assigned.</p>
          ) : (
            <ul className="divide-y divide-line">
              {faculty.advisorOf.map((id) => {
                const s = getStudent(id);
                if (!s) return null;
                return (
                  <li key={id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={s.name} color={s.photoColor} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-navy">{s.name}</p>
                      <p className="text-xs text-muted">{s.enrollmentNo}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      </div>
    </>
  );
}
