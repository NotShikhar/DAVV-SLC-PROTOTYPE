"use client";

import { Award, IndianRupee, TrendingUp, Users } from "lucide-react";
import { STUDENTS } from "@/data";
import { BRANCHES, GRADE_SCALE, computeCGPA } from "@/lib/domain";
import { useHasPermission } from "@/lib/auth";
import { useDemo } from "@/store/demo";
import { formatINR, formatPercent } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Table, Td, Th } from "@/components/ui/Table";
import { StatCard } from "@/components/shared/StatCard";
import { GradeBadge } from "@/components/shared/GradeBadge";
import { gradeTone } from "@/components/shared/GradeBadge";
import { NoAccess } from "@/components/shared/NoAccess";

export default function ReportsPage() {
  const can = useHasPermission("reports.view");
  const imported = useDemo((s) => s.importedStudents);
  const paidFees = useDemo((s) => s.paidFees);

  if (!can) {
    return (
      <>
        <PageHeader title="Reports" />
        <NoAccess />
      </>
    );
  }

  // CGPA
  const cgpas = STUDENTS.map((s) => computeCGPA(s.semesters)).filter((x): x is number => x !== null);
  const avgCgpa = cgpas.length ? cgpas.reduce((a, b) => a + b, 0) / cgpas.length : null;

  // Fees
  let collected = 0;
  let outstanding = 0;
  STUDENTS.forEach((s) =>
    s.fees.forEach((f) => {
      if (f.status === "Paid" || paidFees[f.id]) collected += f.amount;
      else outstanding += f.amount;
    }),
  );

  // Grade distribution & pass rate
  const gradeCounts: Record<string, number> = {};
  let pass = 0;
  let fail = 0;
  STUDENTS.forEach((s) =>
    s.semesters.forEach((sem) =>
      sem.courses.forEach((c) => {
        if (c.grade) {
          gradeCounts[c.grade] = (gradeCounts[c.grade] ?? 0) + 1;
          if (c.grade === "F") fail += 1;
          else pass += 1;
        }
      }),
    ),
  );
  const totalGraded = pass + fail;
  const passRate = totalGraded ? (pass / totalGraded) * 100 : 0;
  const maxGrade = Math.max(1, ...Object.values(gradeCounts));

  // Branch strength
  const strength = BRANCHES.map((b) => ({
    ...b,
    count:
      STUDENTS.filter((s) => s.branch === b.code).length + imported.filter((i) => i.branch === b.code).length,
  })).filter((b) => b.count > 0);

  return (
    <>
      <PageHeader title="Reports & Analytics" description="Cohort-level insight into results, collections and strength." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={STUDENTS.length + imported.length} icon={Users} tone="info" />
        <StatCard label="Average CGPA" value={avgCgpa?.toFixed(2) ?? "—"} icon={TrendingUp} tone="success" />
        <StatCard label="Pass rate" value={formatPercent(passRate)} icon={Award} tone="success" />
        <StatCard label="Fees collected" value={formatINR(collected)} icon={IndianRupee} tone="neutral" hint={`${formatINR(outstanding)} outstanding`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Grade distribution" description={`${totalGraded} course results`}>
          <div className="space-y-3">
            {GRADE_SCALE.map((g) => {
              const count = gradeCounts[g.letter] ?? 0;
              return (
                <div key={g.letter} className="flex items-center gap-3">
                  <span className="w-9">
                    <GradeBadge grade={g.letter} />
                  </span>
                  <div className="flex-1">
                    <ProgressBar value={(count / maxGrade) * 100} tone={gradeTone(g.letter)} aria-label={`Grade ${g.letter}`} />
                  </div>
                  <span className="w-10 text-right text-sm tabular-nums text-slate">{count}</span>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Branch strength" bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Branch</Th>
                <Th className="text-center">Students</Th>
                <Th className="text-center">Intake</Th>
              </tr>
            </thead>
            <tbody>
              {strength.map((b) => (
                <tr key={b.code}>
                  <Td className="font-mono text-xs text-muted">{b.code}</Td>
                  <Td className="font-medium text-navy">{b.name}</Td>
                  <Td className="text-center tabular-nums">{b.count}</Td>
                  <Td className="text-center tabular-nums">{b.intake}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
      </div>
    </>
  );
}
