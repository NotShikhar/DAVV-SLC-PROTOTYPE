"use client";

import { AlertTriangle, CheckCircle2, Download, GraduationCap, Ticket } from "lucide-react";
import { useCurrentStudent } from "@/lib/auth";
import { useDemo } from "@/store/demo";
import { useUi } from "@/store/ui";
import { CALENDAR } from "@/data";
import { ATTENDANCE_THRESHOLD, examEligibility } from "@/lib/domain";
import { generateHallTicket } from "@/lib/pdf";
import { formatDate, toRoman } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge, type Tone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, Td, Th } from "@/components/ui/Table";
import { KeyValue, KeyValueGrid } from "@/components/shared/KeyValue";

const STATUS_TONE: Record<string, Tone> = { Eligible: "success", "At Risk": "warning", Detained: "danger" };
const WINDOW = { open: "2026-10-15", close: "2026-10-30" };

export default function ExaminationsPage() {
  const student = useCurrentStudent();
  const examReg = useDemo((s) => (student ? s.examRegistrations[student.enrollmentNo] : undefined));
  const submitExamForm = useDemo((s) => s.submitExamForm);
  const pushToast = useUi((s) => s.pushToast);
  if (!student) return null;

  const elig = examEligibility(student);
  const canSubmit = elig.status === "Eligible";
  const courses = student.attendance.map((a) => ({ code: a.courseCode, title: a.title }));
  const examSchedule = CALENDAR.filter((e) => e.type === "exam" || e.type === "form");

  const submit = () => {
    const ht = submitExamForm(student.enrollmentNo, {
      semester: student.currentSemester,
      windowOpen: WINDOW.open,
      windowClose: WINDOW.close,
      registeredCourses: courses.map((c) => c.code),
    });
    pushToast({ tone: "success", title: "Exam form submitted", description: `Hall ticket ${ht} generated.` });
  };

  return (
    <>
      <PageHeader
        title="Examinations"
        description={`End-semester exam form for Semester ${toRoman(student.currentSemester)} · window ${formatDate(WINDOW.open)} – ${formatDate(WINDOW.close)}.`}
      />

      {/* Eligibility overview */}
      <Card
        accent
        className={`mb-6 p-5 ${elig.status === "Eligible" ? "border-l-success" : elig.status === "Detained" ? "border-l-danger" : "border-l-warning"}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {elig.status === "Eligible" ? (
              <CheckCircle2 className="size-6 text-success" />
            ) : (
              <AlertTriangle className="size-6 text-warning" />
            )}
            <div>
              <p className="font-heading font-semibold text-navy">Exam eligibility: {elig.status}</p>
              <p className="text-sm text-slate">
                Aggregate attendance {elig.aggregate}% (minimum {ATTENDANCE_THRESHOLD}% required).
              </p>
            </div>
          </div>
          <Badge tone={STATUS_TONE[elig.status]} dot>
            {elig.status}
          </Badge>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Course-wise eligibility" icon={GraduationCap} bodyClassName="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Course</Th>
                  <Th className="text-center">Attendance</Th>
                  <Th className="text-center">Internal /20</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {elig.courses.map((c) => (
                  <tr key={c.courseCode}>
                    <Td>
                      <span className="font-medium text-navy">{c.title}</span>
                      <span className="ml-2 font-mono text-xs text-muted">{c.courseCode}</span>
                      {c.reasons.length > 0 && (
                        <p className="mt-0.5 text-xs text-danger">{c.reasons.join(" ")}</p>
                      )}
                    </Td>
                    <Td className="text-center">
                      <span className={c.attendance < ATTENDANCE_THRESHOLD ? "font-semibold text-danger" : "tabular-nums"}>
                        {c.attendance}%
                      </span>
                    </Td>
                    <Td className="text-center tabular-nums">{c.internal ?? "—"}</Td>
                    <Td>
                      <Badge tone={c.eligible ? "success" : "danger"} dot>
                        {c.eligible ? "Eligible" : "Not eligible"}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>

          <Section title="Examination schedule" description="Semester V key dates">
            <ul className="space-y-3">
              {examSchedule.map((e) => (
                <li key={e.id} className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-cream text-center leading-none">
                    <span className="font-heading text-sm font-bold text-navy">{new Date(e.date).getDate()}</span>
                    <span className="text-[10px] text-muted uppercase">
                      {new Date(e.date).toLocaleDateString("en-IN", { month: "short" })}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy">{e.title}</p>
                    <p className="text-xs text-muted">{e.detail ?? formatDate(e.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* Exam form / hall ticket */}
        <div>
          <Card accent className="sticky top-20 p-5">
            <div className="flex items-center gap-2">
              <Ticket className="size-5 text-navy" />
              <h2 className="font-heading text-base font-semibold text-navy">Examination form</h2>
            </div>

            {examReg?.submitted ? (
              <div className="mt-4">
                <Badge tone="success" dot>
                  Submitted
                </Badge>
                <div className="mt-4 rounded-lg border border-line bg-cream/60 p-4">
                  <KeyValueGrid className="grid-cols-2 sm:grid-cols-2">
                    <KeyValue label="Hall Ticket">{examReg.hallTicketNo}</KeyValue>
                    <KeyValue label="Semester">{toRoman(examReg.semester)}</KeyValue>
                    <KeyValue label="Courses">{examReg.registeredCourses.length}</KeyValue>
                    <KeyValue label="Centre">IET DAVV</KeyValue>
                  </KeyValueGrid>
                </div>
                <Button
                  className="mt-4"
                  fullWidth
                  onClick={() =>
                    generateHallTicket(student, {
                      hallTicketNo: examReg.hallTicketNo!,
                      semester: examReg.semester,
                      courses,
                    })
                  }
                >
                  <Download className="size-4" /> Download hall ticket
                </Button>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-slate">
                  {courses.length} courses will be registered for the end-semester examination.
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-muted">
                  {courses.map((c) => (
                    <li key={c.code} className="flex justify-between">
                      <span>{c.title}</span>
                      <span className="font-mono text-xs">{c.code}</span>
                    </li>
                  ))}
                </ul>

                {!canSubmit && (
                  <p className="mt-4 rounded-btn bg-danger-bg px-3 py-2 text-xs text-danger">
                    You cannot submit the exam form until attendance and internal requirements are met.
                  </p>
                )}

                <Button className="mt-4" fullWidth disabled={!canSubmit} onClick={submit}>
                  Submit exam form
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
