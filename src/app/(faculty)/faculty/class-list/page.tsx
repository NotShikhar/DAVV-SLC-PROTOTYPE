"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { useCurrentFaculty } from "@/lib/auth";
import { studentsForCourse } from "@/data";
import { ATTENDANCE_THRESHOLD, courseEligibility } from "@/lib/domain";
import { toRoman } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Select } from "@/components/ui/Field";
import { Table, Td, Th } from "@/components/ui/Table";

export default function ClassListPage() {
  const faculty = useCurrentFaculty();
  const [course, setCourse] = useState(faculty?.coursesTaught[0]?.courseCode ?? "");
  if (!faculty) return null;

  const roster = studentsForCourse(course);
  const courseMeta = faculty.coursesTaught.find((c) => c.courseCode === course);
  const eligibleCount = roster.filter((s) => courseEligibility(s, course).eligible).length;

  return (
    <>
      <PageHeader title="Class List" description="Roster with attendance, internal marks and exam eligibility." />

      <Section
        title={courseMeta?.title ?? "Course"}
        description={courseMeta ? `${courseMeta.courseCode} · Sem ${toRoman(courseMeta.semester)} · ${roster.length} students` : ""}
        icon={Users}
        action={
          <div className="flex items-center gap-3">
            <Badge tone="success">{eligibleCount} eligible</Badge>
            <div className="w-52">
              <Select value={course} onChange={(e) => setCourse(e.target.value)} aria-label="Course">
                {faculty.coursesTaught.map((c) => (
                  <option key={c.courseCode} value={c.courseCode}>
                    {c.courseCode} — {c.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        }
        bodyClassName="p-0"
      >
        <Table>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Student</Th>
              <Th className="text-center">Attendance</Th>
              <Th className="text-center">Internal /20</Th>
              <Th>Eligibility</Th>
            </tr>
          </thead>
          <tbody>
            {roster.map((stu, i) => {
              const e = courseEligibility(stu, course);
              return (
                <tr key={stu.enrollmentNo}>
                  <Td className="text-muted tabular-nums">{i + 1}</Td>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={stu.name} color={stu.photoColor} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-navy">{stu.name}</p>
                        <p className="font-mono text-xs text-muted">{stu.enrollmentNo}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-center">
                    <span className={e.attendance < ATTENDANCE_THRESHOLD ? "font-semibold text-danger" : "tabular-nums"}>
                      {e.attendance}%
                    </span>
                  </Td>
                  <Td className="text-center tabular-nums">{e.internal ?? "—"}</Td>
                  <Td>
                    <Badge tone={e.eligible ? "success" : "danger"} dot>
                      {e.eligible ? "Eligible" : "Not eligible"}
                    </Badge>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Section>
    </>
  );
}
