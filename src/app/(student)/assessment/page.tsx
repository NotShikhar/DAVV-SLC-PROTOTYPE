"use client";

import { ClipboardCheck, Info } from "lucide-react";
import { useCurrentStudent } from "@/lib/auth";
import { overrideKey, useDemo } from "@/store/demo";
import { INTERNAL_PASS_MARK, internalTotal } from "@/lib/domain";
import { toRoman } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Td, Th } from "@/components/ui/Table";

function cell(value: number | null) {
  return value === null ? <span className="text-muted">—</span> : <span className="tabular-nums">{value}</span>;
}

export default function AssessmentPage() {
  const student = useCurrentStudent();
  const overrides = useDemo((s) => s.internalOverrides);
  if (!student) return null;

  const rows = student.internals.map((ia) => {
    const ov = overrides[overrideKey(ia.courseCode, student.enrollmentNo)];
    const mst2 = ov?.mst2 ?? ia.mst2;
    const quiz = ov?.quiz ?? ia.quiz;
    const total = internalTotal(ia.mst1, mst2, ia.assignment, quiz);
    const finalised = ia.locked || ov != null;
    return { code: ia.courseCode, title: ia.title, mst1: ia.mst1, mst2, assignment: ia.assignment, quiz, total, finalised };
  });

  return (
    <>
      <PageHeader
        title="Internal Assessment"
        description={`Continuous evaluation for Semester ${toRoman(student.currentSemester)} — 20% of the final marks.`}
      />

      <Card accent className="mb-6 flex items-start gap-3 p-4">
        <Info className="mt-0.5 size-5 shrink-0 text-navy" />
        <p className="text-sm text-slate">
          Internal marks combine the better of two Mid-Semester Tests (MST) with your assignment and quiz
          scores, scaled to <strong>20</strong>. A minimum of <strong>{INTERNAL_PASS_MARK}/20</strong> is
          required, along with 75% attendance, to be eligible for the end-semester examination.
        </p>
      </Card>

      <Section icon={ClipboardCheck} title="Component-wise marks" bodyClassName="p-0">
        <Table>
          <thead>
            <tr>
              <Th>Course</Th>
              <Th className="text-center">MST-1 /30</Th>
              <Th className="text-center">MST-2 /30</Th>
              <Th className="text-center">Assign. /10</Th>
              <Th className="text-center">Quiz /10</Th>
              <Th className="text-center">Internal /20</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const belowPass = r.total !== null && r.total < INTERNAL_PASS_MARK;
              return (
                <tr key={r.code}>
                  <Td>
                    <span className="font-medium text-navy">{r.title}</span>
                    <span className="ml-2 font-mono text-xs text-muted">{r.code}</span>
                  </Td>
                  <Td className="text-center">{cell(r.mst1)}</Td>
                  <Td className="text-center">{cell(r.mst2)}</Td>
                  <Td className="text-center">{cell(r.assignment)}</Td>
                  <Td className="text-center">{cell(r.quiz)}</Td>
                  <Td className="text-center">
                    {r.total === null ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <span className={belowPass ? "font-semibold text-danger" : "font-semibold text-navy"}>
                        {r.total}
                      </span>
                    )}
                  </Td>
                  <Td>
                    {r.finalised ? (
                      <Badge tone={belowPass ? "danger" : "success"} dot>
                        {belowPass ? "Below pass" : "Finalised"}
                      </Badge>
                    ) : (
                      <Badge tone="warning" dot>
                        In progress
                      </Badge>
                    )}
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
