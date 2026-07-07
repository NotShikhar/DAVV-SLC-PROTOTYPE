"use client";

import { useState } from "react";
import { CalendarCheck } from "lucide-react";
import { useCurrentFaculty } from "@/lib/auth";
import { useUi } from "@/store/ui";
import { TODAY_ISO, studentsForCourse } from "@/data";
import { ATTENDANCE_THRESHOLD, attendancePercent } from "@/lib/domain";
import { formatDate } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { Table, Td, Th } from "@/components/ui/Table";

export default function AttendancePage() {
  const faculty = useCurrentFaculty();
  const pushToast = useUi((s) => s.pushToast);
  const [course, setCourse] = useState(faculty?.coursesTaught[0]?.courseCode ?? "");
  const [present, setPresent] = useState<Record<string, boolean>>({});

  if (!faculty) return null;
  const roster = studentsForCourse(course);
  const courseMeta = faculty.coursesTaught.find((c) => c.courseCode === course);
  const isPresent = (id: string) => present[id] ?? true;
  const presentCount = roster.filter((s) => isPresent(s.enrollmentNo)).length;

  const submit = () => {
    pushToast({
      tone: "success",
      title: "Attendance recorded",
      description: `${presentCount} present · ${roster.length - presentCount} absent for ${course}.`,
    });
  };

  return (
    <>
      <PageHeader
        title="Attendance Entry"
        description={`Mark today's session — ${formatDate(TODAY_ISO)}.`}
      />

      <Section
        title={courseMeta?.title ?? "Course"}
        description={courseMeta ? `${courseMeta.courseCode} · Section ${courseMeta.section}` : ""}
        icon={CalendarCheck}
        action={
          <div className="flex items-center gap-3">
            <Badge tone="info">{presentCount}/{roster.length} present</Badge>
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
              <Th>Student</Th>
              <Th className="text-center">Overall %</Th>
              <Th className="text-center">Present</Th>
            </tr>
          </thead>
          <tbody>
            {roster.map((stu) => {
              const rec = stu.attendance.find((a) => a.courseCode === course);
              const pct = rec ? attendancePercent(rec) : 0;
              return (
                <tr key={stu.enrollmentNo}>
                  <Td>
                    <span className="font-medium text-navy">{stu.name}</span>
                    <span className="ml-2 font-mono text-xs text-muted">{stu.enrollmentNo}</span>
                  </Td>
                  <Td className="text-center">
                    <span className={pct < ATTENDANCE_THRESHOLD ? "font-semibold text-danger" : "tabular-nums"}>
                      {pct}%
                    </span>
                  </Td>
                  <Td className="text-center">
                    <input
                      type="checkbox"
                      checked={isPresent(stu.enrollmentNo)}
                      onChange={() =>
                        setPresent((p) => ({ ...p, [stu.enrollmentNo]: !isPresent(stu.enrollmentNo) }))
                      }
                      className="size-4 accent-navy"
                      aria-label={`Present: ${stu.name}`}
                    />
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <div className="flex justify-end border-t border-line px-5 py-4">
          <Button onClick={submit}>Submit attendance</Button>
        </div>
      </Section>
    </>
  );
}
