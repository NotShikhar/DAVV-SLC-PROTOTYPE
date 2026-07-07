"use client";

import Link from "next/link";
import { CheckCircle2, ListChecks, XCircle } from "lucide-react";
import { useCurrentStudent } from "@/lib/auth";
import {
  MIN_CREDITS_PER_SEM,
  REQUIRED_CREDITS,
  academicStanding,
  backlogCourses,
  creditsEarned,
  creditsRegistered,
  degreeProgress,
} from "@/lib/domain";
import { toRoman } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Td, Th } from "@/components/ui/Table";
import { CreditMeter } from "@/components/shared/CreditMeter";
import { buttonClasses } from "@/components/ui/Button";

export default function DegreeAuditPage() {
  const student = useCurrentStudent();
  if (!student) return null;

  const progress = degreeProgress(student.semesters);
  const standing = academicStanding(student);
  const backlogs = backlogCourses(student.semesters);
  const completed = student.semesters.filter((s) => s.courses.every((c) => c.status !== "Pending"));

  const checks = [
    {
      label: "Minimum credits earned for the degree",
      ok: progress.earned >= REQUIRED_CREDITS,
      detail: `${progress.earned} / ${REQUIRED_CREDITS}`,
    },
    {
      label: "No pending backlog / ATKT courses",
      ok: backlogs.length === 0,
      detail: backlogs.length ? `${backlogs.length} pending` : "None",
    },
    {
      label: `Every semester ≥ ${MIN_CREDITS_PER_SEM} credits (no Zero Semester)`,
      ok: standing.label !== "Zero Semester",
      detail: standing.label,
    },
  ];
  const graduationReady = checks.every((c) => c.ok);

  return (
    <>
      <PageHeader
        title="Degree Audit"
        description="Track your progress toward the B.E. degree — credits, backlogs and graduation eligibility."
      />

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card accent className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-navy">Overall progress</h2>
            <Badge tone={standing.tone} dot>
              {standing.label}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate">{standing.reason}</p>
          <div className="mt-5">
            <CreditMeter earned={progress.earned} required={progress.required} label="Credits toward degree" />
          </div>
          <p className="mt-2 text-xs text-muted">
            {progress.percent}% complete · {completed.length} of 8 semesters cleared
          </p>
        </Card>

        <Card className={`p-5 ${graduationReady ? "border-l-4 border-l-success" : ""}`}>
          <h2 className="font-heading text-base font-semibold text-navy">Graduation eligibility</h2>
          <p className="mt-1 text-sm">
            {graduationReady ? (
              <span className="text-success">All requirements met.</span>
            ) : (
              <span className="text-muted">In progress — continue clearing requirements.</span>
            )}
          </p>
          <ul className="mt-4 space-y-3">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-2.5">
                {c.ok ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                ) : (
                  <XCircle className="mt-0.5 size-4 shrink-0 text-muted" />
                )}
                <span className="text-sm text-slate">
                  {c.label}
                  <span className="mt-0.5 block text-xs text-muted">{c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {backlogs.length > 0 && (
        <Section
          title="Pending courses (ATKT)"
          description="Clear these via the Supplementary examination."
          action={
            <Link href="/registration" className={buttonClasses("secondary", "sm")}>
              Register supplementary
            </Link>
          }
          bodyClassName="p-0"
          className="mb-6"
        >
          <Table>
            <thead>
              <tr>
                <Th>Course</Th>
                <Th className="text-center">Credits</Th>
                <Th className="text-center">Total</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {backlogs.map((c) => (
                <tr key={c.courseCode}>
                  <Td>
                    <span className="font-medium text-navy">{c.title}</span>
                    <span className="ml-2 font-mono text-xs text-muted">{c.courseCode}</span>
                  </Td>
                  <Td className="text-center tabular-nums">{c.credits}</Td>
                  <Td className="text-center tabular-nums">
                    {c.internal !== null && c.external !== null ? c.internal + c.external : "—"}
                  </Td>
                  <Td>
                    <Badge tone="danger" dot>
                      Backlog
                    </Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
      )}

      <Section title="Semester-wise credits" icon={ListChecks} bodyClassName="p-0">
        <Table>
          <thead>
            <tr>
              <Th>Semester</Th>
              <Th>Session</Th>
              <Th className="text-center">Registered</Th>
              <Th className="text-center">Earned</Th>
              <Th className="text-center">SGPA</Th>
            </tr>
          </thead>
          <tbody>
            {student.semesters.map((sem) => {
              const pending = sem.courses.some((c) => c.status === "Pending");
              return (
                <tr key={sem.semester}>
                  <Td className="font-medium text-navy">Semester {toRoman(sem.semester)}</Td>
                  <Td className="text-muted">{sem.session}</Td>
                  <Td className="text-center tabular-nums">{creditsRegistered(sem.courses)}</Td>
                  <Td className="text-center tabular-nums">
                    {pending ? <span className="text-muted">—</span> : creditsEarned(sem.courses)}
                  </Td>
                  <Td className="text-center tabular-nums">{sem.sgpa != null ? sem.sgpa.toFixed(2) : "—"}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Section>
    </>
  );
}
