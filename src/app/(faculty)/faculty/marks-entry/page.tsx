"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import type { Student } from "@/types";
import { useCurrentFaculty } from "@/lib/auth";
import { overrideKey, useDemo } from "@/store/demo";
import { useUi } from "@/store/ui";
import { studentsForCourse } from "@/data";
import { INTERNAL_PASS_MARK, internalTotal } from "@/lib/domain";
import { toRoman } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { Table, Td, Th } from "@/components/ui/Table";
import { cn } from "@/lib/utils/cn";

export default function MarksEntryPage() {
  const faculty = useCurrentFaculty();
  const overrides = useDemo((s) => s.internalOverrides);
  const saveInternalMarks = useDemo((s) => s.saveInternalMarks);
  const pushToast = useUi((s) => s.pushToast);

  const [course, setCourse] = useState(faculty?.coursesTaught[0]?.courseCode ?? "");
  const [edits, setEdits] = useState<Record<string, { mst2: string; quiz: string }>>({});

  if (!faculty) return null;
  const roster = studentsForCourse(course);
  const courseMeta = faculty.coursesTaught.find((c) => c.courseCode === course);

  const eff = (stu: Student) => {
    const ia = stu.internals.find((i) => i.courseCode === course)!;
    const key = overrideKey(course, stu.enrollmentNo);
    const ov = overrides[key];
    const e = edits[key];
    const mst2str = e?.mst2 ?? (ov?.mst2 ?? ia.mst2)?.toString() ?? "";
    const quizstr = e?.quiz ?? (ov?.quiz ?? ia.quiz)?.toString() ?? "";
    const mst2 = mst2str === "" ? null : Number(mst2str);
    const quiz = quizstr === "" ? null : Number(quizstr);
    const total = internalTotal(ia.mst1, mst2, ia.assignment, quiz);
    return { ia, key, mst2str, quizstr, total };
  };

  const setField = (stu: Student, field: "mst2" | "quiz", raw: string, max: number) => {
    const { key, mst2str, quizstr } = eff(stu);
    const clamped = raw === "" ? "" : String(Math.max(0, Math.min(max, Math.round(Number(raw) || 0))));
    setEdits((prev) => ({
      ...prev,
      [key]: {
        mst2: field === "mst2" ? clamped : mst2str,
        quiz: field === "quiz" ? clamped : quizstr,
      },
    }));
  };

  const save = () => {
    let count = 0;
    roster.forEach((stu) => {
      const { mst2str, quizstr } = eff(stu);
      if (mst2str !== "" && quizstr !== "") {
        saveInternalMarks(course, stu.enrollmentNo, { mst2: Number(mst2str), quiz: Number(quizstr) });
        count += 1;
      }
    });
    setEdits((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => !k.startsWith(`${course}:`))));
    pushToast({
      tone: "success",
      title: "Marks saved",
      description: `Internal marks finalised for ${count} student(s).`,
    });
  };

  return (
    <>
      <PageHeader
        title="Marks Entry"
        description="Enter Mid-Semester Test-II and quiz scores. The internal (/20) updates live and reflects on each student's record."
      />

      <Section
        title={courseMeta?.title ?? "Course"}
        description={courseMeta ? `${courseMeta.courseCode} · Sem ${toRoman(courseMeta.semester)} · Section ${courseMeta.section}` : ""}
        action={
          <div className="w-56">
            <Select value={course} onChange={(e) => setCourse(e.target.value)} aria-label="Course">
              {faculty.coursesTaught.map((c) => (
                <option key={c.courseCode} value={c.courseCode}>
                  {c.courseCode} — {c.title}
                </option>
              ))}
            </Select>
          </div>
        }
        bodyClassName="p-0"
      >
        <Table>
          <thead>
            <tr>
              <Th>Student</Th>
              <Th className="text-center">MST-1 /30</Th>
              <Th className="text-center">MST-2 /30</Th>
              <Th className="text-center">Assign. /10</Th>
              <Th className="text-center">Quiz /10</Th>
              <Th className="text-center">Internal /20</Th>
            </tr>
          </thead>
          <tbody>
            {roster.map((stu) => {
              const { ia, mst2str, quizstr, total } = eff(stu);
              const below = total !== null && total < INTERNAL_PASS_MARK;
              return (
                <tr key={stu.enrollmentNo}>
                  <Td>
                    <span className="font-medium text-navy">{stu.name}</span>
                    <span className="ml-2 font-mono text-xs text-muted">{stu.enrollmentNo}</span>
                  </Td>
                  <Td className="text-center tabular-nums">{ia.mst1 ?? "—"}</Td>
                  <Td className="text-center">
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={mst2str}
                      onChange={(e) => setField(stu, "mst2", e.target.value, 30)}
                      className="w-16 rounded-btn border border-line px-2 py-1 text-center text-sm focus:border-navy focus:ring-2 focus:ring-navy/20 focus-visible:outline-none"
                    />
                  </Td>
                  <Td className="text-center tabular-nums">{ia.assignment ?? "—"}</Td>
                  <Td className="text-center">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={quizstr}
                      onChange={(e) => setField(stu, "quiz", e.target.value, 10)}
                      className="w-16 rounded-btn border border-line px-2 py-1 text-center text-sm focus:border-navy focus:ring-2 focus:ring-navy/20 focus-visible:outline-none"
                    />
                  </Td>
                  <Td className="text-center">
                    {total === null ? (
                      <Badge tone="warning">Pending</Badge>
                    ) : (
                      <span className={cn("font-semibold", below ? "text-danger" : "text-navy")}>{total}</span>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <div className="flex justify-end border-t border-line px-5 py-4">
          <Button onClick={save}>
            <Save className="size-4" /> Save marks
          </Button>
        </div>
      </Section>
    </>
  );
}
