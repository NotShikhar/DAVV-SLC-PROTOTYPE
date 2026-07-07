"use client";

import { Award, RotateCcw } from "lucide-react";
import { useCurrentStudent } from "@/lib/auth";
import { useUi } from "@/store/ui";
import { classification, computeCGPA, degreeProgress } from "@/lib/domain";
import { toRoman } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, Td, Th } from "@/components/ui/Table";
import { StatCard } from "@/components/shared/StatCard";
import { GradeBadge } from "@/components/shared/GradeBadge";

export default function ResultsPage() {
  const student = useCurrentStudent();
  const pushToast = useUi((s) => s.pushToast);
  if (!student) return null;

  const cgpa = computeCGPA(student.semesters);
  const progress = degreeProgress(student.semesters);
  const completed = student.semesters.filter((s) => s.courses.every((c) => c.status !== "Pending"));
  const latestCompletedSem = completed.at(-1)?.semester;
  const ordered = [...student.semesters].sort((a, b) => b.semester - a.semester);

  return (
    <>
      <PageHeader
        title="Results"
        description="Semester-wise results with the internal (20) + external (80) breakdown, grades and SGPA."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="CGPA" value={cgpa?.toFixed(2) ?? "—"} tone="success" icon={Award} />
        <StatCard label="Classification" value={<span className="text-base">{classification(cgpa)}</span>} tone="info" />
        <StatCard label="Credits earned" value={progress.earned} tone="info" />
        <StatCard label="Semesters completed" value={completed.length} tone="neutral" />
      </div>

      <div className="space-y-6">
        {ordered.map((sem) => {
          const pending = sem.courses.some((c) => c.status === "Pending");
          return (
            <Section
              key={sem.semester}
              title={`Semester ${toRoman(sem.semester)}`}
              description={sem.session}
              action={
                pending ? (
                  <Badge tone="warning" dot>
                    Results awaited
                  </Badge>
                ) : sem.semester === latestCompletedSem ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      pushToast({
                        tone: "info",
                        title: "Revaluation requested",
                        description: `Applied for Semester ${toRoman(sem.semester)}. Best score is retained.`,
                      })
                    }
                  >
                    <RotateCcw className="size-4" /> Request revaluation
                  </Button>
                ) : undefined
              }
              bodyClassName="p-0"
            >
              <Table>
                <thead>
                  <tr>
                    <Th>Course</Th>
                    <Th className="text-center">Internal /20</Th>
                    <Th className="text-center">External /80</Th>
                    <Th className="text-center">Total</Th>
                    <Th className="text-center">Grade</Th>
                    <Th className="text-center">GP</Th>
                  </tr>
                </thead>
                <tbody>
                  {sem.courses.map((c) => (
                    <tr key={c.courseCode}>
                      <Td>
                        <span className="font-medium text-navy">{c.title}</span>
                        <span className="ml-2 font-mono text-xs text-muted">{c.courseCode}</span>
                      </Td>
                      <Td className="text-center tabular-nums">{c.internal ?? "—"}</Td>
                      <Td className="text-center tabular-nums">{c.external ?? "—"}</Td>
                      <Td className="text-center font-medium tabular-nums text-navy">
                        {c.internal !== null && c.external !== null ? c.internal + c.external : "—"}
                      </Td>
                      <Td className="text-center">
                        <GradeBadge grade={c.grade} />
                      </Td>
                      <Td className="text-center tabular-nums">{c.gradePoint ?? "—"}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="flex items-center justify-end gap-3 border-t border-line px-5 py-3">
                {sem.courses.some((c) => c.status === "Backlog") && (
                  <Badge tone="danger" dot>
                    Backlog present
                  </Badge>
                )}
                <span className="text-sm text-muted">SGPA</span>
                <span className="font-heading text-base font-semibold text-navy">
                  {sem.sgpa != null ? sem.sgpa.toFixed(2) : "—"}
                </span>
              </div>
            </Section>
          );
        })}
      </div>
    </>
  );
}
