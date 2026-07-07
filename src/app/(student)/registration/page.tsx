"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Lock, RotateCcw } from "lucide-react";
import { useCurrentStudent } from "@/lib/auth";
import { useUi } from "@/store/ui";
import { coursesForBranchSemester } from "@/data";
import { backlogCourses, MIN_CREDITS_PER_SEM } from "@/lib/domain";
import { EXTERNAL_PORTALS } from "@/lib/domain/constants";
import { semesterParity, toRoman } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PortalLink } from "@/components/shared/PortalLink";
import { cn } from "@/lib/utils/cn";

function SelectableRow({
  type,
  checked,
  disabled,
  onChange,
  title,
  code,
  category,
  credits,
}: {
  type: "checkbox" | "radio";
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  title: string;
  code: string;
  category: string;
  credits: number;
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
        disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
        checked ? "border-navy bg-navy/5" : "border-line hover:bg-cream",
      )}
    >
      <input
        type={type}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="size-4 accent-navy"
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-navy">{title}</p>
        <p className="text-xs text-muted">
          {code} · {category}
        </p>
      </div>
      {disabled ? <Lock className="size-3.5 text-muted" /> : null}
      <span className="text-sm font-semibold text-navy tabular-nums">{credits} cr</span>
    </label>
  );
}

export default function RegistrationPage() {
  const student = useCurrentStudent();
  const pushToast = useUi((s) => s.pushToast);
  const [registered, setRegistered] = useState(false);
  const [suppRegistered, setSuppRegistered] = useState(false);

  const sem = student?.currentSemester ?? 5;
  const all = useMemo(
    () => (student ? coursesForBranchSemester(student.branch, sem) : []),
    [student, sem],
  );
  const core = all.filter((c) => c.category === "Core" || c.category === "Laboratory");
  const programElectives = all.filter((c) => c.category === "Program Elective");
  const openElectives = all.filter((c) => c.category === "Open Elective");

  const registeredCodes = useMemo(
    () => new Set(student?.semesters.find((s) => s.semester === sem)?.courses.map((c) => c.courseCode) ?? []),
    [student, sem],
  );

  const [selPE, setSelPE] = useState<string[]>(() =>
    programElectives.filter((c) => registeredCodes.has(c.code)).map((c) => c.code),
  );
  const [selOE, setSelOE] = useState<string>(
    () => openElectives.find((c) => registeredCodes.has(c.code))?.code ?? openElectives[0]?.code ?? "",
  );

  if (!student) return null;

  const backlogs = backlogCourses(student.semesters);
  const selectedCourses = [
    ...core,
    ...programElectives.filter((c) => selPE.includes(c.code)),
    ...openElectives.filter((c) => c.code === selOE),
  ];
  const totalCredits = selectedCourses.reduce((s, c) => s + c.credits, 0);
  const meetsMin = totalCredits >= MIN_CREDITS_PER_SEM;

  const togglePE = (code: string) =>
    setSelPE((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : prev.length < 2 ? [...prev, code] : prev,
    );

  const confirm = () => {
    setRegistered(true);
    pushToast({
      tone: "success",
      title: "Registration confirmed",
      description: `${totalCredits} credits registered for Semester ${toRoman(sem)}.`,
    });
  };

  return (
    <>
      <PageHeader
        title="Semester Registration"
        description={`Register your subjects and electives for Semester ${toRoman(sem)} (${semesterParity(sem)}).`}
        actions={
          registered ? (
            <Badge tone="success" dot>
              Registered
            </Badge>
          ) : (
            <PortalLink href={EXTERNAL_PORTALS.davvSIS.url}>Register on SIS</PortalLink>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Core courses" description="Compulsory for your branch — auto-registered." icon={ClipboardList}>
            <div className="space-y-2">
              {core.map((c) => (
                <SelectableRow
                  key={c.code}
                  type="checkbox"
                  checked
                  disabled
                  onChange={() => {}}
                  title={c.title}
                  code={c.code}
                  category={c.category}
                  credits={c.credits}
                />
              ))}
            </div>
          </Section>

          <Section
            title="Program electives"
            description="Choose exactly two from the discipline basket."
            action={<Badge tone={selPE.length === 2 ? "success" : "warning"}>{selPE.length}/2 chosen</Badge>}
          >
            <div className="space-y-2">
              {programElectives.map((c) => {
                const checked = selPE.includes(c.code);
                return (
                  <SelectableRow
                    key={c.code}
                    type="checkbox"
                    checked={checked}
                    disabled={registered || (!checked && selPE.length >= 2)}
                    onChange={() => togglePE(c.code)}
                    title={c.title}
                    code={c.code}
                    category={c.category}
                    credits={c.credits}
                  />
                );
              })}
            </div>
          </Section>

          <Section title="Open elective" description="Choose one course from any discipline (CBCS generic elective).">
            <div className="space-y-2">
              {openElectives.map((c) => (
                <SelectableRow
                  key={c.code}
                  type="radio"
                  checked={selOE === c.code}
                  disabled={registered}
                  onChange={() => setSelOE(c.code)}
                  title={c.title}
                  code={c.code}
                  category={c.category}
                  credits={c.credits}
                />
              ))}
            </div>
          </Section>

          {backlogs.length > 0 && (
            <Section
              title="Supplementary (ATKT) registration"
              description="Register backlog courses for the supplementary examination."
              icon={RotateCcw}
              accent
            >
              <div className="space-y-2">
                {backlogs.map((c) => (
                  <div
                    key={c.courseCode}
                    className="flex items-center justify-between rounded-lg border border-line px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-navy">{c.title}</p>
                      <p className="text-xs text-muted">
                        {c.courseCode} · {c.credits} credits
                      </p>
                    </div>
                    <Badge tone="danger" dot>
                      Backlog
                    </Badge>
                  </div>
                ))}
              </div>
              <Button
                className="mt-4"
                variant={suppRegistered ? "secondary" : "primary"}
                disabled={suppRegistered}
                onClick={() => {
                  setSuppRegistered(true);
                  pushToast({
                    tone: "success",
                    title: "Supplementary registered",
                    description: `${backlogs.length} backlog course(s) registered for the supplementary exam.`,
                  });
                }}
              >
                {suppRegistered ? "Supplementary registered" : "Register for supplementary"}
              </Button>
            </Section>
          )}
        </div>

        {/* Summary */}
        <div>
          <Card accent className="sticky top-20 p-5">
            <h2 className="font-heading text-base font-semibold text-navy">Registration summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Core</dt>
                <dd className="text-navy">{core.length} courses</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Program electives</dt>
                <dd className="text-navy">{selPE.length} chosen</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Open elective</dt>
                <dd className="text-navy">{selOE ? 1 : 0} chosen</dd>
              </div>
            </dl>
            <div className="mt-4 border-t border-line pt-4">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-sm text-muted">Total credits</span>
                <span className="font-heading text-2xl font-bold text-navy tabular-nums">{totalCredits}</span>
              </div>
              <ProgressBar
                value={Math.min(100, (totalCredits / 24) * 100)}
                tone={meetsMin ? "success" : "warning"}
              />
              <p className={cn("mt-1.5 text-xs", meetsMin ? "text-success" : "text-warning")}>
                {meetsMin
                  ? `Meets the ${MIN_CREDITS_PER_SEM}-credit CBCS minimum.`
                  : `Below the ${MIN_CREDITS_PER_SEM}-credit minimum — a “Zero Semester” would apply.`}
              </p>
            </div>
            <Button
              className="mt-5"
              fullWidth
              disabled={registered || selPE.length !== 2 || !selOE}
              onClick={confirm}
            >
              {registered ? (
                <>
                  <CheckCircle2 className="size-4" /> Registered
                </>
              ) : (
                "Confirm registration"
              )}
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
